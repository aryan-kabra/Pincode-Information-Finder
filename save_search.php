<?php

include "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $search_type = $_POST["search_type"];
    $search_value = $_POST["search_value"];
    $post_office = $_POST["post_office"];
    $district = $_POST["district"];
    $state = $_POST["state"];
    $pincode = $_POST["pincode"];

    $sql = "INSERT INTO search_history
            (search_type, search_value, post_office, district, state, pincode)
            VALUES
            ('$search_type',
             '$search_value',
             '$post_office',
             '$district',
             '$state',
             '$pincode')";

    if(mysqli_query($conn,$sql))
    {
        echo "Saved";
    }
    else
    {
        echo "Error";
    }

}

mysqli_close($conn);

?>