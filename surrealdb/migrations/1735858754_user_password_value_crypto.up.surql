DEFINE FIELD OVERWRITE password ON TABLE user TYPE string
    VALUE crypto::bcrypt::generate($value);