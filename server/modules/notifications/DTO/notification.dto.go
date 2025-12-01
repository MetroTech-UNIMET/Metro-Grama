package DTO

import "metrograma/models"

type NotificationDTO struct {
	All    []models.Notification `json:"all"`
	Unread []models.Notification `json:"unread"`
}
