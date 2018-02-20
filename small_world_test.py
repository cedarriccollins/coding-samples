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


'''
Small World
Given a list of points in the plane, write a program that outputs each point along 
with the three other points that are closest to it. 
These three points should be ordered by distance.

For example, given a set of points where each line is of the form: ID x-coordinate y-coordinate

1  0.0      0.0
2  10.1     -10.1
3  -12.2    12.2
4  38.3     38.3
5  79.99    179.99


Your program should output:

1 2,3,4
2 1,3,4
3 1,2,4
4 1,2,3
5 4,3,1

Assumption is made that the following file is in the same directory as the test.py

in_data.txt
-------------
1 0.0 0.0
2 10.1 -10.1
3 -12.2 12.2
4 38.3 38.3
5 79.99 179.99

'''

def create_data_dict(filename):

    data_dict = {}
    file = open(filename, 'r')
    for line in file:
        line =  line.split(" ")
        data_dict.update({int(line[0]):(float(line[1]),float(line[2]))})
    return data_dict

def process_dict(data_dict):
    for o_key in data_dict.items():
        highest = 0
        highest_key = 0
        distance_dict = {}
        
        for i_key in data_dict.items():
            if(o_key == i_key): #skip
                continue
            dist = math.hypot(o_key[1][0] - i_key[1][0], o_key[1][1] - i_key[1][1])
            if dist > highest:
                highest = dist
                highest_key = i_key[0]
          
            distance_dict.update({i_key[0]:dist})
        
        del distance_dict[highest_key]
        my_tuple=  sorted(distance_dict.items(), key = lambda distance_dict:distance_dict[1])

        #-- output data
        point_id_str = ''
        for k,v in my_tuple:
            point_id_str = point_id_str + "," + str(k)
        point_id_str = point_id_str[1:]
        print str(o_key[0]) + ' ' + point_id_str

print factorial_itr(5)
print factorial(5)       
data_dict = create_data_dict('in_data.txt')
process_dict(data_dict)
