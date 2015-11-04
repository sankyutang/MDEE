var parseQueryString = function( queryString ) {
    var params = {}, queries, temp, i, l;
 	var search = location.search;
    // Split into key/value pairs
    var queryString = search.substring( search.indexOf('?') + 1 );
    queries = queryString.split("&");
 
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
 
    return params;
};