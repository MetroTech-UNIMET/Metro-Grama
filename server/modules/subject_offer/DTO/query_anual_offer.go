package DTO

import "metrograma/models"

type QueryAnnualOffer struct {
	models.AnnualOfferEntity
	Schedules []models.SubjectScheduleEntity `json:"schedules"`
}
