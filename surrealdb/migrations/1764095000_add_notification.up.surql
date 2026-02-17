DEFINE TABLE notification SCHEMAFULL;

DEFINE FIELD user ON notification TYPE record<user>;
DEFINE FIELD type ON notification TYPE 'friendRequest' | 'friendAccepted' | 'subject_section_update';
DEFINE FIELD extraData ON notification FLEXIBLE TYPE object DEFAULT {};
DEFINE FIELD title ON notification TYPE string ASSERT string::len($value) <= 160;
DEFINE FIELD message ON notification TYPE string ASSERT string::len($value) <= 2048;
DEFINE FIELD read ON notification TYPE bool DEFAULT false;
DEFINE FIELD read_at ON notification TYPE option<datetime>;
DEFINE FIELD created_at ON notification TYPE datetime DEFAULT time::now();

DEFINE INDEX notification_by_user_status ON notification FIELDS user, read;
DEFINE INDEX notification_by_user_created_at ON notification FIELDS user, created_at;


DEFINE EVENT friend_request_created_notification ON friend
WHEN $event = "CREATE" AND $after.status = "pending"
THEN (
    CREATE notification CONTENT {
        user: $after.in.user,
        type: "friendRequest",
        extraData: {
            friend_id: $after.id,
            sender: $after.out,
            recipient: $after.in,
            actor: $after.out.user.firstName + ' ' + $after.out.user.lastName,
            image: $after.out.user.pictureUrl
        },
        title: "Nueva petición de amistad",
        message: "$actor te ha enviado una petición de amistad",
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
            recipient: $after.in,
            actor: $after.in.user.firstName + ' ' + $after.in.user.lastName,
            image: $after.in.user.pictureUrl
        },
        title: "Petición de amistad aceptada",
        message: "$actor ha aceptado tu petición de amistad",
    }
);

DEFINE EVENT subject_section_history_notification ON subject_section_history
WHEN $event = "CREATE"
THEN {
    FOR $user IN (SELECT VALUE in.user FROM course
        WHERE  $after.id IN principal_sections.concat(secondary_sections)){
        CREATE notification CONTENT {
            user: $user,
            type: "subject_section_update",
            extraData: {
                history: $after.id,
                subject_section: $after.subject_section,
                actor: $after.user_id.firstName + ' ' + $after.user_id.lastName,
                image: $after.user_id.pictureUrl
            },
            message: "$actor ha modificado una sección que decidiste inscribir",
        }
    };  
};