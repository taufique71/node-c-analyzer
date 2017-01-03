// Returns true of false depending on whether querying location is enclosed
// inside enclosing location.
// query_loc = { row: 1, col: 2}
// enclosing_loc = {
//     start: {row: 0, col: 0},
//     end: {row: 10, col: 10}
// }
var is_enclosed_inside = function(query_loc, enclosing_loc){
    if(query_loc.row > enclosing_loc.start.row){
        if(query_loc.row < enclosing_loc.end.row) return true;
        else if(query_loc.row > enclosing_loc.end.row) return false;
        else{
            if(query_loc.col < enclosing_loc.end.col) return true;
            else if(query_loc.col > enclosing_loc.end.col) return false;
        }
    }
    else if(query_loc.row < enclosing_loc.start.row) return false;
    else{
        if(query_loc.col > enclosing_loc.start.col) return true;
        else if(query_loc.col < enclosing_loc.start.col) return false;
    }
};
module.exports.is_enclosed_inside = is_enclosed_inside;
