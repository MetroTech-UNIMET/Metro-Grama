DEFINE FIELD credits ON subject TYPE number DEFAULT 0;
DEFINE FIELD BPCredits ON subject TYPE number DEFAULT 0;

UPDATE subject SET credits = 0, BPCredits = 0;