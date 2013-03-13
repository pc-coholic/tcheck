<?php
$filename = "res/tcheck_1.0.xpi";

// Reopen the file and erase the contents
$fp = fopen("cnt_" . $filename . ".txt", "w");

// Get the existing count
$count = fread($fp, 1024);

// Add 1 to the existing count
$count = $count + 1;

// Write the new count to the file
fwrite($fp, $count);

// Close the file
fclose($fp);


/**
 * The following header is required for browsers that do not
 * recognize the xpi extension. i.e all browsers other than Firefox.
 * This will display the familiar 'save/open' dialog if the xpi
 * extension is not supported.
 */
header("Content-Disposition: filename={$filename}");

/* Tell the browser that the content that is coming is an xpinstall */
header('Content-type: application/x-xpinstall');

 
/* Also send the content length */
header('Content-Length: ' . filesize($filename));
 
 
/* readfile reads the file content and echos it to the output */
readfile($filename);
?> 