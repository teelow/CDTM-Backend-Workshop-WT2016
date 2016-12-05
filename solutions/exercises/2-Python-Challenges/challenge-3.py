class Person():

    def __init__(self, name, age, study_subject="Computer Science"):
        # study subject has default value "Computer Science"
        self.name = name
        self.age = age
        self.study_subject = study_subject
        self.friend = None

    def add_one_year(self):
        self.age +=1

    # bonus
    def hasFriend(self):
        return self.friend != None

# bonus
class Friend():
    name = "Hermann"    # all friends are called Hermann


def printFriend(person):
    if person.hasFriend():
        print person.name + " has a friend named " + person.friend.name
    else:
        print person.name + " is forever alone :-("

if __name__ == '__main__':
    person1 = Person("Michael", 22)
    printFriend(person1)

    person2 = Person("Tobi", 12, study_subject="Kindergarden-Rebel")
    person2.friend = Friend()
    printFriend(person2)

    print person2.name + " is " + str(person2.age) + " years old."
    person2.add_one_year()
    print person2.name + " is " + str(person2.age) + " years old."
