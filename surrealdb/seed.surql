FOR $i IN range::len(.Subjects) {
    LET $subjectsByTrimester = .Subjects[$i];
    FOR $j IN range::len($subjectsByTrimester) {
        LET $subject = $subjectsByTrimester[$j];
        IF $subject != NONE {
            IF $subject.SubjectType = "new" {
                LET $subjectID = "subjectID" + string($i) + "_" + string($j);
                CREATE $subjectID SET name = $subject.name, credits = $subject.credits, BPCredits = $subject.BPCredits;
            }
            LET $subjectID = "subjectID" + string($i) + "_" + string($j);
            RELATE $subjectID->belong->$careerID SET trimester = $i;
        }
    }
}
