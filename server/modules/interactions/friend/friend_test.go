package friend_test

import (
	"context"
	"metrograma/db"
	"metrograma/modules/interactions/friend/services"
	"metrograma/testutils"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func setupFriendTest(t *testing.T) {
	testutils.SetupEcho()

	// Cleanup
	surrealdb.Query[any](context.Background(), db.SurrealDB, "REMOVE TABLE notification; REMOVE TABLE friend; REMOVE TABLE student; REMOVE TABLE user;", nil)

	// Define Schema needed for Events and Relations
	query := `
	DEFINE TABLE user SCHEMALESS;
	DEFINE TABLE student SCHEMALESS;
	
	DEFINE TABLE friend TYPE RELATION IN student OUT student ENFORCED SCHEMAFULL PERMISSIONS NONE;
	DEFINE FIELD created ON friend TYPE datetime READONLY VALUE time::now() PERMISSIONS FULL;
	DEFINE FIELD status ON friend TYPE 'pending' | 'accepted' | 'blocked' DEFAULT 'pending' PERMISSIONS FULL;
	DEFINE INDEX unique_relationships ON friend FIELDS in, out UNIQUE;

	DEFINE TABLE notification SCHEMAFULL;
	DEFINE FIELD user ON notification TYPE record<user>;
	DEFINE FIELD type ON notification TYPE 'friendRequest' | 'friendAccepted' | 'subject_section_update';
	DEFINE FIELD extraData ON notification FLEXIBLE TYPE object DEFAULT {};
	DEFINE FIELD title ON notification TYPE string ASSERT string::len($value) <= 160;
	DEFINE FIELD message ON notification TYPE string ASSERT string::len($value) <= 2048;
	DEFINE FIELD read ON notification TYPE bool DEFAULT false;
	DEFINE FIELD read_at ON notification TYPE option<datetime>;
	DEFINE FIELD created_at ON notification TYPE datetime DEFAULT time::now();

	DEFINE EVENT friend_request_created_notification ON friend
	WHEN $event = "CREATE" AND $after.status = "pending"
	THEN (
		CREATE notification CONTENT {
			user: $after.in.user,
			type: "friendRequest",
			extraData: {
				friend_id: $after.id,
				sender: $after.out,
				recipient: $after.in
			},
			title: "Nueva petición de asmitad",
			message: "Tienes una nueva petición de amistad",
		}
	);

	DEFINE EVENT friend_request_accepted_notification ON friend
	WHEN $event = "UPDATE" AND $before.status != "accepted" AND $after.status = "accepted"
	THEN (
		CREATE notification CONTENT {
			user: $after.out.user,
			type: "friendAccepted",
			extraData: {
				friend_id: $after.id,
				sender: $after.out,
				recipient: $after.in
			},
			title: "Petición de amistad aceptada",
			message: "Tu amigo ha aceptado la petición de amistad",
		}
	);
	`
	_, err := surrealdb.Query[any](context.Background(), db.SurrealDB, query, nil)
	assert.NoError(t, err)
}

func TestFriendRequestAndAccept(t *testing.T) {
	setupFriendTest(t)

	// 1. Create Users and Students
	// Student A
	userAID := surrealModels.NewRecordID("user", "userA")
	studentAID := surrealModels.NewRecordID("student", "studentA")
	_, err := surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("user"), map[string]any{"id": userAID})
	assert.NoError(t, err)
	_, err = surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("student"), map[string]any{"id": studentAID, "user": userAID})
	assert.NoError(t, err)

	// Student B
	userBID := surrealModels.NewRecordID("user", "userB")
	studentBID := surrealModels.NewRecordID("student", "studentB")
	_, err = surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("user"), map[string]any{"id": userBID})
	assert.NoError(t, err)
	_, err = surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("student"), map[string]any{"id": studentBID, "user": userBID})
	assert.NoError(t, err)

	// 2. Send Friend Request: A -> B
	// services.RelateFriends(me, other)
	friendship, err := services.RelateFriends(studentAID, studentBID)
	assert.NoError(t, err)
	t.Logf("Friendship Created: In=%v, Out=%v", friendship.In, friendship.Out)
	assert.Equal(t, "pending", friendship.Status)

	// Wait for event to trigger? SurrealDB events are synchronous usually, but let's see.
	time.Sleep(100 * time.Millisecond)

	// Debug: Print all notifications
	allNotes, _ := surrealdb.Query[[]map[string]any](context.Background(), db.SurrealDB, "SELECT * FROM notification", nil)
	t.Logf("All Notifications: %+v", (*allNotes)[0].Result)

	// 3. Verify Notification for User B
	// The event creates notification for $after.in.user -> studentB.user -> userB
	result, err := surrealdb.Query[[]map[string]any](context.Background(), db.SurrealDB, "SELECT * FROM notification WHERE user=$user AND type='friendRequest'", map[string]any{"user": userBID})
	assert.NoError(t, err)
	assert.NotEmpty(t, (*result)[0].Result)

	// 4. Accept Friend Request: B accepts A
	// services.AcceptFriendshipRequest(me, other). 'me' is B, 'other' is A.
	accepted, err := services.AcceptFriendshipRequest(studentBID, studentAID)
	assert.NoError(t, err)
	assert.Equal(t, "accepted", accepted.Status)

	time.Sleep(100 * time.Millisecond)

	// 5. Verify Notification for User A
	// The event creates notification for $after.out.user -> studentA.user -> userA
	resultA, err := surrealdb.Query[[]map[string]any](context.Background(), db.SurrealDB, "SELECT * FROM notification WHERE user=$user AND type='friendAccepted'", map[string]any{"user": userAID})
	assert.NoError(t, err)
	assert.NotEmpty(t, (*resultA)[0].Result)
}
