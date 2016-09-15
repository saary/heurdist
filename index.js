function getLevenshtein(str1, str2) {
  // base cases
  if (str1 === str2) return 0;
  if (str1.length === 0) return str2.length;
  if (str2.length === 0) return str1.length;

  // two rows
  var prevRow = new Array(str2.length + 1),
      curCol, nextCol, i, j, tmp;

  // initialise previous row
  for (i=0; i<prevRow.length; ++i) {
    prevRow[i] = i;
  }

  // calculate current row distance from previous row
  for (i=0; i<str1.length; ++i) {
    nextCol = i + 1;

    for (j=0; j<str2.length; ++j) {
      curCol = nextCol;

      // substution
      nextCol = prevRow[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 );
      // insertion
      tmp = curCol + 1;
      if (nextCol > tmp) {
        nextCol = tmp;
      }
      // deletion
      tmp = prevRow[j + 1] + 1;
      if (nextCol > tmp) {
        nextCol = tmp;
      }

      // copy current col value into previous (in preparation for next iteration)
      prevRow[j] = curCol;
    }

    // copy last col value into previous (in preparation for next iteration)
    prevRow[j] = nextCol;
  }

  return nextCol;
}


/// Credits to http://siderite.blogspot.com/2014/11/super-fast-and-accurate-string-distance.html
// Sift4 - common version
// online algorithm to compute the distance between two strings in O(n)
// maxOffset is the number of characters to search for matching letters
// maxDistance is the distance at which the algorithm should stop computing the value and just exit (the strings are too different anyway)
function sift4(s1, s2, maxOffset, maxDistance) {
  if (!s1||!s1.length) {
    if (!s2) {
      return 0;
    }
    return s2.length;
  }

  if (!s2||!s2.length) {
    return s1.length;
  }

  var l1=s1.length;
  var l2=s2.length;

  var c1 = 0;  //cursor for string 1
  var c2 = 0;  //cursor for string 2
  var lcss = 0;  //largest common subsequence
  var local_cs = 0; //local common substring
  var trans = 0;  //number of transpositions ('ab' vs 'ba')
  var offset_arr=[];  //offset pair array, for computing the transpositions

  while ((c1 < l1) && (c2 < l2)) {
    if (s1.charAt(c1) == s2.charAt(c2)) {
      local_cs++;
      var isTrans=false;
      //see if current match is a transposition
      var i=0;
      while (i<offset_arr.length) {
        var ofs=offset_arr[i];
        if (c1<=ofs.c1 || c2 <= ofs.c2) {
          // when two matches cross, the one considered a transposition is the one with the largest difference in offsets
          isTrans=Math.abs(c2-c1)>=Math.abs(ofs.c2-ofs.c1);
          if (isTrans)
          {
            trans++;
          } else
          {
            if (!ofs.trans) {
              ofs.trans=true;
              trans++;
            }
          }
          break;
        }
        else {
          if (c1>ofs.c2 && c2>ofs.c1) {
            offset_arr.splice(i,1);
          }
          else {
            i++;
          }
        }
      }
      offset_arr.push({
        c1:c1,
        c2:c2,
        trans:isTrans
      });
    }
    else {
      lcss+=local_cs;
      local_cs=0;
      if (c1!=c2) {
        c1=c2=Math.min(c1,c2);  //using min allows the computation of transpositions
      }
      //if matching characters are found, remove 1 from both cursors (they get incremented at the end of the loop)
      //so that we can have only one code block handling matches 
      for (var i = 0; i < maxOffset && (c1+i<l1 || c2+i<l2); i++) {
        if ((c1 + i < l1) && (s1.charAt(c1 + i) == s2.charAt(c2))) {
          c1+= i-1; 
          c2--;
          break;
        }
        if ((c2 + i < l2) && (s1.charAt(c1) == s2.charAt(c2 + i))) {
          c1--;
          c2+= i-1;
          break;
        }
      }
    }

    c1++;
    c2++;
    if (maxDistance)
    {
      var temporaryDistance=Math.max(c1,c2)-lcss+trans;
      if (temporaryDistance>=maxDistance) return Math.round(temporaryDistance);
    }
    // this covers the case where the last match is on the last token in list, so that it can compute transpositions correctly
    if ((c1 >= l1) || (c2 >= l2)) {
      lcss+=local_cs;
      local_cs=0;
      c1=c2=Math.min(c1,c2);
    }
  }
  
  lcss+=local_cs;
  return Math.round(Math.max(l1,l2)- lcss +trans); //add the cost of transpositions to the final result
}

function getHeuristicDistance(s1, s2) {
  s1 = s1 || '';
  s2 = s2 || '';

  var maxDistance = Math.floor(Math.max(s1.length, s2.length) / 2);
  // perform a fast computation
  var approximateDistance = sift4(s1, s2, 5);

  // if the distance is close, perform an exact computation
  if (approximateDistance <= maxDistance) {
    return getLevenshtein(s1, s2);
  }

  return approximateDistance;
}

function distance(s1, s2) {
  s1 = s1 || '';
  s2 = s2 || '';

  var levScore = getHeuristicDistance(s1, s2);
  var score = (levScore / Math.max(s1.length, s2.length)) * 100;

  return score;
}

function similarity(s1, s2) {
  s1 = s1 || '';
  s2 = s2 || '';

  var levScore = getHeuristicDistance(s1, s2);
  var score = (levScore / Math.max(s1.length, s2.length)) * 100;

  return 100 - score;
}

exports.sift4 = sift4;
exports.levenshteinDistance = getLevenshtein;
exports.heuristicDistance = getHeuristicDistance;
exports.distance = distance;
exports.similarity = similarity;

