// ===== PRINT HISTOGRAM ======
// Given an array of integers [2, 1, 2, 101, 4, 95, 3, 250, 4, 1, 2, 2, 7, 98, 123, 99, ...]
// Write a function to print the following tabular output with ‘xxx' that resembles a histogram (your output should closely match the sample output below, including "99+" to capture the count for all numbers > 99):
// Num | count
//   1 | xx
//   2 | xxxx
//   3 | x
//   4 | xx
// ...
//  98 | x
//  99 | x
// 99+ | xxx

var dataset = [2,2,4,2,6,4,7,7,7,7,8,,50,60,60,60,60,99,100,200, 300];

createHistographObject = function(ary) 
{
    return ary.reduce(function(counter, item) 
	{
        
        if(item > 99)
		{
			counter["99+"] = counter.hasOwnProperty("99+")?	counter["99+"]+="X" : counter["99+"] = "X"
		}
		else
		{
		counter[item] = counter.hasOwnProperty(item) ? counter[item]+="X" : "X";
		}
		
        return counter;
    }, {}
	)
}

console.log(createHistographObject(dataset));



// ===== PAIRS OF 10 ======
// Given array of integers [1, 6, 3, 2, 5, 5, 7, 8, 4, 8, 2, 5, 9, 9, 1, ...]
// Write a function to print out all pairs that sum to 10 with average/best O(n) run-time complexity.
// Sample output: (1,9), (1,9), (6,4), (3,7), (2,8), (2,8), (5,5), (5,5), (5,5), (8,2), (8,2), (9,1), (9,1)
// Can print the pairs in any order, as long as numbers inside the pair respect the same order in which they appear in the original array. 
//And it is acceptable to print each pair in a separate line.

dataset2 = [1, 6, 3, 2, 5, 5, 7, 8, 4, 8, 2, 5, 9, 9, 1];

for(x = 0; x < dataset2.length; x++)
{
	for (y = x; y < dataset2.length; y ++) // set y = x to eliminate duplicates
	{
		if (y==x)
		{
			continue;
		}
		if(dataset2[x] + dataset2[y] == 10 )
		{
			
			//console.log( "x= " + x + " y = "+ y);
			console.log( dataset2[x] + " , " + dataset2[y]);
		
		}
			
		
	}
	
}

// ===== STRINGS ======
// Write a function that takes an input string and prints out various substrings as illustrated by the following sample outputs:
// - input “ab” should print “”, “a”, “b”, “ab"
// - input “abc” should print “”, “a”, “b”, “c”, “ab”, “ac”, “bc”, “abc"
// - input “abcd” should print “”, “a”, “b”, “c”, “d”, “ab”, “ac”, “ad”, “bc”, “bd”, “cd”, “abc”, “abd”, “acd”, “bcd”, “abcd"
// The function can return/print the substrings in any order (no duplicates).
// And it is acceptable to print each string in a separate line.

function createCombinations(set, k) 
{
	var i, j, combs, headList, endCombs;
	
	// K-sized set has only one K-sized subset.
	if (k == set.length) 
	{
		return [set];
	}
	
	// There is N 1-sized subsets in a N-sized set.
	if (k == 1) 
	{
		combs = [];
		for (i = 0; i < set.length; i++) 
		{
			combs.push([set[i]]);
		}
		return combs;
	}
	

	combs = [];
	for (i = 0; i < set.length - k + 1; i++) 
	{
		
		// headList is a list that includes only our current element.
		headList = set.slice(i, i + 1);
		
		// We take smaller combinations from the subsequent elements
		endCombs = createCombinations(set.slice(i + 1), k - 1);
		
		// For each (k-1)-combination we join it with the current
		// and store it to the set of k-combinations.
		for (j = 0; j < endCombs.length; j++) 
		{
			combs.push(headList.concat(endCombs[j]));
		}
	}
	return combs;
}


function combinations(set) 
{
	var k, i, combs, k_combs;
	combs = [];
	
	// Calculate all non-empty k-combinations
	for (k = 1; k <= set.length; k++) 
	{
		k_combs = createCombinations(set, k);
		for (i = 0; i < k_combs.length; i++) 
		{
			combs.push(k_combs[i]);
		}
	}
	return combs;
}

data = "abcd".slice()
console.log(combinations(data))