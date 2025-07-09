<?php
$path=$_SERVER['DOCUMENT_ROOT'];
require_once $path."/attendanceapp/database/database.php";
require_once $path."/attendanceapp/database/sessionDetails.php";
require_once $path."/attendanceapp/database/facultyDetails.php";
require_once $path."/attendanceapp/database/courseRegistrationDetails.php";
require_once $path."/attendanceapp/database/attendanceDetails.php";
function createCSVReport($list,$filename)
{
    $error=0;
    $path=$_SERVER['DOCUMENT_ROOT'];
    $finalFileName=$path.$filename;
    try{
        $fp=fopen($finalFileName,"w");
        foreach($list as $line)
        {
            fputcsv($fp,$line);
        }
    }
    catch(Exception $e)
    {
         $error=1;
    }
}
if(isset($_REQUEST['action']))
{
    $action=$_REQUEST['action'];
    if($action=="getSession")
    {
         $dbo=new Database();
         $sobj=new SessionDetails();
         $rv=$sobj->getSessions($dbo);
         echo json_encode($rv);
    }
    if($action=="getFacultyCourses")
    {
         $facid=$_POST['facid'];
         $sessionid=$_POST['sessionid'];
         $dbo=new Database();
         $fo=new faculty_details();
         $rv=$fo->getCoursesInASession($dbo,$sessionid,$facid);
         echo json_encode($rv);
    }
    if($action=="getStudentList")
    {
         $classid=$_POST['classid'];
         $sessionid=$_POST['sessionid'];
         $facid=$_POST['facid'];
         $ondate=$_POST['ondate'];
         $dbo=new Database();
        $crgo=new CourseRegistrationDetails();
        $allstudents=$crgo->getRegisteredStudents($dbo,$sessionid,$classid);
        $ado=new attendanceDetails();
        $presentStudents=$ado->getPresentListOfAClassByAFacOnADate($dbo,$sessionid,$classid,$facid,$ondate);
        $attendanceStatusObject=$ado->getJSONAttenDanceReport($dbo,$sessionid,$classid,$facid,101);
        for($i=0;$i<count($allstudents);$i++)
        {
            $allstudents[$i]['isPresent']='NO';
            for($j=0;$j<count($presentStudents);$j++)
            {
                if($allstudents[$i]['id']==$presentStudents[$j]['student_id'])
                {
                    $allstudents[$i]['isPresent']='YES';
                    break;
                }
            }
            $attendancelist=$attendanceStatusObject['studentlist'];
            for($j=0;$j<count($attendancelist);$j++)
            {
                if($allstudents[$i]['id']==$attendancelist[$j]['id'])
                {
                    $allstudents[$i]['attended']=$attendancelist[$j]['attended'];
                    $allstudents[$i]['percent']=$attendancelist[$j]['percent'];
                    break;
                }
            }
        }
         $rv=['total'=>$attendanceStatusObject['total'],'studentlist'=>$allstudents];
         echo json_encode($rv);
    }
    if($action=="saveattendance")
    {
         $courseid=$_POST['courseid'];
         $sessionid=$_POST['sessionid'];
         $studentid=$_POST['studentid'];
         $facultyid=$_POST['facultyid'];
         $ondate=$_POST['ondate'];
         $status=$_POST['ispresent'];
         $dbo=new Database();
        $ado=new attendanceDetails();
        $rv=$ado->saveAttendance($dbo,$sessionid,$courseid,$facultyid,$studentid,$ondate,$status);
         echo json_encode($rv);
    }

    if($action=="downloadSummaryReport"||$action=="downloadDetailsReport")
    {
         $courseid=$_POST['classid'];
         $sessionid=$_POST['sessionid'];
         $facultyid=$_POST['facid'];
        
         $dbo=new Database();
        $ado=new attendanceDetails();
         $list=[
            [1,"MCJ21001",20.00],
            [2,"BBM21002",30.00],
            [3,"COM21003",40.00]
         ];
         $list=[];
         if($action=='downloadSummaryReport')
         {
            $list=$ado->getAttenDanceReport($dbo,$sessionid,$courseid,$facultyid);         
         }
         else{
            $list=$ado->getDetailedAttenDanceReport($dbo,$sessionid,$courseid,$facultyid);         
         }
         $filename="/attendanceapp/report.csv";
         $rv=["filename"=>$filename];
         createCSVReport($list,$filename);
         echo json_encode($rv);
    }
    if($action=='getdefaulterStudentList')
    {
        $rv=[];
        $courseid=$_POST['classid'];
        $sessionid=$_POST['sessionid'];
        $facultyid=$_POST['facid'];
        $cutoff=$_POST['cutoff'];
        $dbo=new Database();
        $ado=new attendanceDetails();
        $list=$ado->getJSONAttenDanceReport($dbo,$sessionid,$courseid,$facultyid,$cutoff);
        $rv=$list;
        echo json_encode($rv);
    }
    if ($action == 'sendEmailToDefaulterStudents') {
        $rv = [];
        $courseid = $_POST['classid'];
        $sessionid = $_POST['sessionid'];
        $facultyid = $_POST['facid'];
        $cutoff = $_POST['cutoff'];
        
        $dbo = new Database();
        $ado = new attendanceDetails();
        $list = $ado->getJSONAttenDanceReport($dbo, $sessionid, $courseid, $facultyid, $cutoff);
        
        $fo = new faculty_details();
        $fname = $fo->getFacultyName($dbo, $facultyid);
        $courseName = $ado->getCourseName($dbo, $courseid);
        $studentlist = $list['studentlist'];
    
        $mailsent = 'NOTOK';
        foreach ($studentlist as $student) {
            $toemail = $student['email_id'];
            $studentid = $student['id'];
            $sname = $student['name'];
            $currentTimestamp = time();
            $ondate = date("Y-m-d H:i:s", $currentTimestamp);
            $message = 'Dear ' . $sname . ', you have a shortage of attendance, less than ' . $cutoff . '%, in ' . $courseName . ' taken by ' . $fname . '. Please meet the corresponding faculty ASAP.';
    
            
            if (filter_var($toemail, FILTER_VALIDATE_EMAIL)) {
                $headers = "From: sitsattendance@gmail.com\r\n";
                $headers .= "Reply-To:".$toemail;
                $headers .= "X-Mailer: PHP/" . phpversion();
    
                $c = mail($toemail, "SHORTAGE OF ATTENDANCE", $message, $headers);
                if ($c) {
                $mailsent = 'OK';
                $ado->logSentEmail($dbo, $sessionid, $courseid, $facultyid, $studentid, $message, $ondate, $toemail);
                } else {
                
                error_log("Failed to send email to: $toemail");
                }
            }
           
        }
        $rv['mailsent'] = $mailsent;
        echo json_encode($rv);
    }
}
?>
