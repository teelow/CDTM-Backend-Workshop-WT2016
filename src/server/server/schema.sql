PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS Tasks;
DROP TABLE IF EXISTS Lists;
-- TODO: Create Table Lists here
CREATE TABLE Lists(
    list_id     INTEGER     PRIMARY KEY AUTOINCREMENT,
    title       STRING      NOT NULL,
    revision    INTEGER     NOT NULL DEFAULT 1,
    inbox       INTEGER     NOT NULL DEFAULT 0,
    created     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Tasks(
-- TODO: Create Table Tasks here
    task_id     INTEGER     PRIMARY KEY AUTOINCREMENT,
    list        Lists       NOT NULL,
    title       STRING      NOT NULL,
    status      STRING      NOT NULL,
    description STRING      NOT NULL,
    due         TIMESTAMP,
    revision    INTEGER     NOT NULL DEFAULT 1,
    created     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(list) REFERENCES Lists(list_id) ON DELETE CASCADE
);