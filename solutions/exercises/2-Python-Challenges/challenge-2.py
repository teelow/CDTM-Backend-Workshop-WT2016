

def main():
    # 1. Create a list that contains the numbers from one to 100
    list1 = []
    for x in range(1,101):
        list1.append(x)

    ## Alternative
    list2 = range(1,101)

    # 2. Create a list that contains the numbers from one to 100 except for 50.
    list_without_50 = []
    for x in range(1,100):
        if x != 50:
            list_without_50.append(x)


if __name__ == '__main__':
    main()
