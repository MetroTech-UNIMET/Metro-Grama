DEFINE FIELD electivesTrimesters ON career TYPE array<number> DEFAULT [];
DEFINE FIELD emoji ON career TYPE string;

UPDATE career:sistemas SET emoji="💾", electivesTrimesters = [];
UPDATE career:quimica SET emoji="🧪", electivesTrimesters = [];