<?php
$str = "Здравствуйте, 
    ".$_REQUEST["first_name"]. " 
    ".$_REQUEST["last_name"]."! <br>";
$str .="Вы выбрали для изучения курс по 
    ".$_REQUEST["kurs"];
echo $str;
?>
