'''
Magic Square
A 3x3 normal magic square is a 3x3 grid where the numbers on each row,
each column, and both diagonals all add up to the same number, and the
square contains the numbers 1 to 9 exactly. For example, the following
is the Lo Shu magic square:
4 9 2
3 5 7
8 1 6
Implement a function which, given a two-dimensional 3 by 3 array of
ints returns a boolean that tells us if the given square (represented
by the array) is a normal 3 by 3 magic square or not.
'''

matrix= [[4,9,2],
         [3,5,7],
         [8,1,6]]

matrix2= [[4,9,2],
         [3,5,7],
         [7,1,6]]

#lets start with the diagonals, since we are summing those by explict location
def magic_square_test(square):
    magic_value = square[0][0] + square [1][1]+ square[2][2]
    if(magic_value != (square[0][2] + square[1][1] + square[2][0])):
        return False
    #now for the rows
    for row in square:
        if (sum(row) != magic_value):
            return False
     # now for the "columns" which we are going to turn into rows... 
     # we will transpose matirx with with a list comprehension, we have to cast each row
     # to a list bc zip() natively returns a list of tuples.
     # Honeslty, we could have made a small utility function out of:
     #
     #  if (sum(row) != magic_value):
     #       return False
     # but since I am only using it twice I think its ok here listed twice.
    
    transposed_square = [list(i) for i in zip(*square)]
    for row in transposed_square:
        if (sum(row) != magic_value):
            return False
    # if we got all the way here, then doggone it, we have a NORMAL 3x3 MAGIC SQUARE!!
    return True

print magic_square_test(matrix2)
print magic_square_test(matrix)
