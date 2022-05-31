<?php
// matchmoves_eventsource.php
include "../origin.php";
include "../database_access.php";
include "../rtfunctions.php";

//get the higest matchmoves id so we can start from new entrys only.
$matchmoves_id = 0;
$query = "SELECT matchmoves_id FROM matchmoves ORDER BY matchmoves_id DESC LIMIT 1;";
$data = $rtdb->query($query);
while($row = $data->fetch_assoc()) {
	foreach($row as $key => $value){ 
		if($key == 'matchmoves_id'){
			$matchmoves_id = $value;
		}
	}
}

// send a ping so the page is not pending till a move is made.
echo "event: ping\n";

while (true) {
	header("Cache-Control: no-cache");
	header("Content-Type: text/event-stream");
	// makes the query with updated matchmoves id efry time we get a move and sends this to the database on a 1sec basis.
	$query = "SELECT matchmoves_id, match_id, move, fen FROM matchmoves WHERE matchmoves_id > '$matchmoves_id';";
	$data = $rtdb->query($query);

	//if the query has a result deconstuct it and send it.
	if($data->num_rows > 0) {
		
		while($row = $data->fetch_assoc()) {
				$array= [];
			foreach($row as $key => $value){
				if($key == 'matchmoves_id'){
					$matchmoves_id = $value;
				}else{
					$array[$key] = $value;
				}
			}
			// could send a id with the object.
			//echo "id: {$array['match_id']}\n\n";
			
			// encodes the asociative array in a json object and send it.
			$array = json_encode($array);
			echo "data: {$array} \n\n";
		}
	}else{
		// we have no new entrys
	}

	while (ob_get_level() > 0) {
		ob_end_flush();
	  }
	flush();
	//  Break the loop if the client aborted the connection (closed the page)
	if ( connection_aborted() ) break;
	sleep(1);
}
$rtdb->close();
?>
