import random

def get_random_array(length):
    array  = []
    for _ in range(0, length):
        random_number = random.randint(1,10)
        array.append(random_number)
    return array

def sort_in_place(array):
    for number in array:
        for check in range(len(array) - 1, 0, -1):
            for number in range(check):
                if array[number] > array[number+1]:
                    temp = array[number]
                    array[number] = array[number+1]
                    array[number+1] = temp

if __name__ == '__main__':

    myArray = get_random_array(100)
    print myArray

    sort_in_place(myArray)
    print myArray
