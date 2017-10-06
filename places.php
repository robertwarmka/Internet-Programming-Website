<?php
header("Access-Control-Allow-Origin: *");

$category = $_POST['category'];
$radius = $_POST['radius'];
$lat = $_POST['lat'];
$lon = $_POST['lon'];
$key = "AIzaSyB5a3KMJwiDFv7xEaJKx2QBWVMxOpzjlGY";
$full_array = array();
$ch = curl_init();
$url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=$lat,$lon&radius=$radius&type=$category&key=$key";
curl_setopt($ch, CURLOPT_URL, $url);
// Set so curl_exec returns the result instead of outputting it.
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Get the response and close the channel.
$response = curl_exec($ch);
$data = json_decode($response);
$full_array[] = $data;
while (array_key_exists('next_page_token', $data)) {
  sleep(3);
  $url = utf8_encode("https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=$key&pagetoken=$data->next_page_token");
  curl_setopt($ch, CURLOPT_URL, $url);
  $response = curl_exec($ch);
  $data = json_decode($response);
  $full_array[] = $data;
}
curl_close($ch);

$full_array = json_encode($full_array);
echo $full_array;

?>
