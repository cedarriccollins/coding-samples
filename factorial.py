'''
Factorials
Write two methods to calculate Factorials for an input number.  
In the first method calculate it iteratively.  

In the second method calculate it recursively.  
The results can be output to standard output, returned from the function as an array/list, etc.
'''
import math 

def factorial(number):
    if number == 0:
        return 1
    else:
        return number * factorial(number-1)


def factorial_itr(number):
    num = 1
    while number >= 1:
        num = num * number
        number = number - 1
    return num