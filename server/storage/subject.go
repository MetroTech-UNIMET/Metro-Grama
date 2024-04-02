package storage

import (
	"context"
)

type Subject struct {
	Code string
	Name string
}

func GetSubjectByCareer(ctx context.Context, career string) (Graph[Subject], error) {
	return Graph[Subject]{}, nil
}

func CreateSubject(ctx context.Context, subjectName string, subjectCode string, careerName string, trimester uint, precedesCode string) error {

	return nil
}
