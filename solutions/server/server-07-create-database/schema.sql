PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS Lists;
CREATE TABLE Lists(
    id          INTEGER      PRIMARY KEY AUTOINCREMENT,
    title       TEXT         NOT NULL,
    revision    INTEGER      NOT NULL DEFAULT 1,
    inbox       INTEGER      NOT NULL DEFAULT 0,
    created     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Tasks;
CREATE TABLE Tasks(
    id          INTEGER      PRIMARY KEY AUTOINCREMENT,
    list        INTEGER      NOT NULL,
    title       TEXT         NOT NULL,
    status      TEXT         NOT NULL,
    description TEXT         NOT NULL DEFAULT '',
    due         TIMESTAMP    ,
    revision    INTEGER      NOT NULL DEFAULT 1,
    created     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(list) REFERENCES Lists(id) ON DELETE CASCADE
);
