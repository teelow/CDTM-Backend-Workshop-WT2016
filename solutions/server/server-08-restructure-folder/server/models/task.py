class Task:
    """Represents one Todo-Item"""
    
    NORMAL = 'normal'
    COMPLETED = 'completed'

    def __init__(self, title, list, id='', status = NORMAL, description = '', due = '', revision = 1):
        self.id = id
        self.list = list
        self.title =  title
        self.status = status
        self.description = description
        self.due = due
        self.revision = revision
