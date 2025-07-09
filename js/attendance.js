
function  getSessionHTML(rv)
{
    let x=``;
    x=`<option value=-1>SELECT ONE</option>`;
    let i=0;
    for(i=0;i<rv.length;i++)
    {
        let cs=rv[i];
        x=x+`<option value=${cs['id']}>${cs['year']+" "+cs['term']}</option>`;
    }
    return x;
}
function loadSessions()
{
    $.ajax({
        url:"ajaxhandler/attendanceAJAX.php",
        type:"POST",
        dataType:"json",
        data:{action:"getSession"},
        beforeSend:function(e)
        {
            $("#overlay").fadeIn();
        },
        success:function(rv)
        {
            $("#overlay").fadeOut();
            let x=getSessionHTML(rv);
            $("#ddlclass").html(x);
        },
        error:function(e)
        {
            $("#overlay").fadeOut();
            alert("OOPS!");
        }
    });
}
function getCourseCardHTML(classlist)
{
  let x=``;
  x=``;
  let i=0;
  for(i=0;i<classlist.length;i++)
  {
    let cc=classlist[i];
    x=x+`<div class="classcard" data-classobject='${JSON.stringify(cc)}'>${cc['code']}</div>`;
  }
  return x;
}

function fetchFacultyCourses(facid,sessionid)
{
    $.ajax({
        url:"ajaxhandler/attendanceAJAX.php",
        type:"POST",
        dataType:"json",
        data:{facid:facid,sessionid:sessionid,action:"getFacultyCourses"},
        beforeSend:function(e)
        {
            $("#overlay").fadeIn();
        },
        success:function(rv)
        {
           $("#overlay").fadeOut(); 
        let x=getCourseCardHTML(rv);
        $("#classlistarea").html(x);
        },
        error:function(e)
        {
            $("#overlay").fadeOut();
        }
    });
}

function getClassdetailsAreaHTML(classobject)
{
    let dobj=new Date();    
    let ondate=`2023-02-01`;
    let year=dobj.getFullYear();
    let month=dobj.getMonth()+1;
    if(month<10)
    {
        month="0"+month;
    }
    let day=dobj.getDate();
    if(day<10)
    {
        day="0"+day;
    }
    ondate=year+"-"+month+"-"+day;
 let x=`<div class="classdetails">
 <div class="code-area">${classobject['code']}</div>
 <div class="title-area">${classobject['title']}</div>
 <div class="ondate-area">
     <input type="date" value='${ondate}' id='dtpondate'>
 </div>
</div>`;
x=x+`
<div class='navbarcover'>
<div class="navbar">
  <a href="#" id='linkTakeAttendance'>TAKE ATTENDANCE</a>
  <a href="#" id='linkEmailAttendanceShortage'>NOTIFY ATTENDANCE SHORTAGE</a>
  <a href="#" id='linkReport'>REPORT</a>
</div>
</div>
`;
 return x;
}

function getDeafulterListHTML(o,caption='')
{
    if(caption=='')
    {
        caption="When you click 'SEND EMAIL,' an email will be automatically sent to all the students listed above.";
    }

    let i=0;
    let x=``;
    x=x+`
    <div>
    Total Classes=<label class="boldlabel">${o.total}</label>
    </div>
    `;
    if(o['studentlist'].length>0)
    {
        for (i=0;i<o['studentlist'].length;i++)
        {
            let cs=o['studentlist'][i];
            x=x+`<div class="dstudentdetails " id="dstudent${cs['id']}">
            <div class="dslno-area">${(i+1)}</div>
            <div class="drollno-area">${cs['roll_no']}</div>
            <div class="dname-area">${cs['name']}</div>
            <div class="demail-area">${cs['email_id']}</div>
            <div class="dattended-area"><label class='topLabel'>${cs['attended']}</label><label class='subLabel'>CLASSES</label></div>
            <div class="dpercent-area"><label class='topLabel'>${cs['percent']}</label><label class='subLabel'>%</label></div>
            <div class="dsent-area"><label class='topLabel'>${cs['sent_count']}</label><label class='subLabel'>NOTIFIED</label></div>
            </div>`;
        }
        x=x+`<div class='divstatus'>
        <p id='pStatus'>${caption}</p>        
        </div>
        <div class='divsendmailbtn'>
        <button class='button' id='btnSendEmail'>SEND EMAIL</bitton>
        </div>
      `;
    }
    else{
        x=x+`<div class='divstatus'>
        <p id='pStatus'>NO DEFAULTER STUDENTS</p>        
        </div>`;
    }
    
    
return x;
}
function getReportPanel()
{
    let x=`<div class='divDownloadReports'>
           
            <button class='button' id='btnDetailed'>DOWNLOAD DETAILS</button>
            </div> 
            <div id="divReport"></div>         
        `;
    return x;
}
function getSendEmailPanel()
{
    let x=`<div class='divSendEmailNotificationInner'>
            <div class="searchSendEmail"> 
            <input type='text' id='txtCutOff' class="transparent-textbox" placeholder="Enter Attendance Cut Off">
            <button class='button' id='btnLoadDeafulterList'>GO</button>
            </div>

            <div id='defaulterStudentList' class='defaulterStudentList'>
            </div>
            </div> 
        `;
    return x;
}
function getStudentListHTML(o)
{    
  let studentList=o['studentlist'];
  let x=`<div class="studenttlist">
  <label>TOTAL CLASS=</label><label class="boldlabel">${o.total}</label>
         </div>`;
 let i=0;
 for(i=0;i<studentList.length;i++)
 {
    let cs=studentList[i];
    let checkedState=``;
    let rowcolor='absentcolor';
    if(cs['isPresent']=='YES')
    {
        checkedState=`checked`;
        rowcolor='presentcolor'
    }

    x=x+`<div class="studentdetails ${rowcolor}" id="student${cs['id']}">
    <div class="slno-area">${(i+1)}</div>
    <div class="rollno-area">${cs['roll_no']}</div>
    <div class="name-area">${cs['name']}</div>
    <div class="attended-area"><label class='topLabel'>${cs['attended']}</label><label class='subLabel'>CLASSES</label></div>
    <div class="percent-area"><label class='topLabel'>${cs['percent']}</label><label class='subLabel'>%</label></div>
    <div class="checkbox-area" data-studentid='${cs['id']}'>
        <input type="checkbox" class="cbpresent" data-studentid='${cs['id']}' ${checkedState}>
        <!--we will do it dynamically, but before that lets save 
        a few attendance-->
    </div>
    </div>`;
 }  
  return x;
}

function fetchStudentList(sessionid,classid,facid,ondate)
{
    $.ajax({
        url:"ajaxhandler/attendanceAJAX.php",
        type:"POST",
        dataType:"json",
        data:{facid:facid,ondate:ondate,sessionid:sessionid,classid:classid,action:"getStudentList"},
        beforeSend:function(e)
        {
            $("#overlay").fadeIn();
        },
        success:function(rv)
        {
            $("#overlay").fadeOut();
          let x=getStudentListHTML(rv);
          $("#studentlistarea").html(x);
        },
        error:function(e)
        {
            $("#overlay").fadeOut();
        }
    });
}
function saveAttendance(studentid,courseid,facultyid,sessionid,ondate,ispresent)
{
    $.ajax({
        url:"ajaxhandler/attendanceAJAX.php",
        type:"POST",
        dataType:"json",
        data:{studentid:studentid,courseid:courseid,facultyid:facultyid,sessionid:sessionid,ondate:ondate,ispresent:ispresent,action:"saveattendance"},
        beforeSend:function(e)
        {
        },
        success:function(rv)
        {
        if(ispresent=="YES")
        {
            $("#student"+studentid).removeClass('absentcolor');
           $("#student"+studentid).addClass('presentcolor');
        }
        else{
            $("#student"+studentid).removeClass('presentcolor');
            $("#student"+studentid).addClass('absentcolor');
        }
        },
        error:function(e)
        {
            alert("OOPS!");
        }
    });
}

function downloadCSV(sessionid,classid,facid,name='downloadDetailsReport')
{
    $.ajax({
        url:"ajaxhandler/attendanceAJAX.php",
        type:"POST",
        dataType:"json",
        data:{sessionid:sessionid,classid:classid,facid:facid,action:name},
        beforeSend:function(e)
        {
            $("#overlay").fadeIn();
        },
        success:function(rv)
        {
            $("#overlay").fadeOut();
       let x=`
       <object data=${rv['filename']} type="text/html" target="_parent"></object>       
       `;
       $("#divReport").html(x);
        },
        error:function(e)
        {
            $("#overlay").fadeOut();
            alert("OOPS!");
        }
    });
}
function getDefaulterList(sessionid,classid,facid,cutoff=75,caption='')
{
    $.ajax({
        url:"ajaxhandler/attendanceAJAX.php",
        type:"POST",
        dataType:"json",
        data:{facid:facid,sessionid:sessionid,classid:classid,cutoff:cutoff,action:"getdefaulterStudentList"},
        beforeSend:function(e)
        {
            $("#overlay").fadeIn();           
        },
        success:function(rv)
        {
         $("#overlay").fadeOut();

         let x=getDeafulterListHTML(rv,caption);
         $("#defaulterStudentList").html(x);
        },
        error:function(e)
        {
            $("#overlay").fadeOut();
            alert('Something went wrong!');
        }
    });
}

function sendEmails(sessionid, classid, facid, cutoff) {
    $.ajax({
        url: "ajaxhandler/attendanceAJAX.php",
        type: "POST",
        dataType: "json",
        data: {
            facid: facid,
            sessionid: sessionid,
            classid: classid,
            cutoff: cutoff,
            action: "sendEmailToDefaulterStudents"
        },
        beforeSend: function () {
            $("#overlay").fadeIn();
        },
        success: function (result) {
            console.log("Server response:", result);
            $("#overlay").fadeOut();

            if (result['mailsent'] === 'OK') {
                loadDefaulter('EMAIL SENT');
                alert("Emails have been successfully sent to defaulter students.");
            } else {
                loadDefaulter('EMAIL NOT SENT');
                alert("Failed to send emails. Please check the logs for more details.");
                if (result['message']) {
                    console.log("Error message:", result['message']);
                }
            }
        },
        error: function (xhr, status, error) {
            console.log("AJAX Error:", status, error);
            alert("Something went wrong with the email sending request. Please try again later.");
            $('#pStatus').text('EMAIL NOT SENT');
            $("#overlay").fadeOut();
        },
        complete: function () {
            // Ensure the overlay is hidden after the request completes
            $("#overlay").fadeOut();
        }
    });
}


function loadTakeAttendance()
{
    let sessionid=$("#ddlclass").val();
         let classid=$("#hiddenSelectedCourseID").val();
         let facid=$("#hiddenFacId").val();
         let ondate=$("#dtpondate").val();
         if(sessionid!=-1)
         {
            fetchStudentList(sessionid,classid,facid,ondate);
         }
}
function loadDefaulter(caption='')
{
    let sessionid=$("#ddlclass").val();
        let classid=$("#hiddenSelectedCourseID").val();
        let facid=$("#hiddenFacId").val();
        let cutoff=$("#txtCutOff").val();
        if (cutoff!='' && !isNaN(cutoff)) {
            getDefaulterList(sessionid,classid,facid,cutoff,caption);
        } else {
           alert('INVALID INPUT');
        }
}
$(function(e)
{
    $(document).on("click","#btnLogout",function(ee)
    {
          $.ajax(
            {
                url:"ajaxhandler/logoutAjax.php",
                type:"POST",
                dataType:"json",
                data:{id:1},
                beforeSend:function(e){
                    $("#overlay").fadeIn();
                },
                success:function(e){
                        $("#overlay").fadeOut();
                    document.location.replace("login.php");
                },
                error:function(e){
                    $("#overlay").fadeOut();
                    alert("Something went wrong!");
                }
            }
          );
    });
    loadSessions();
    $(document).on("change","#ddlclass",function(e)
    {
        $("#classlistarea").html(``);
        $("#classdetailsarea").html(``);
        $("#studentlistarea").html(``);
        let si=$("#ddlclass").val();
        if(si!=-1)
        {
            let sessionid=si;
            let facid=$("#hiddenFacId").val();
            fetchFacultyCourses(facid,sessionid);
        }     
    });
    $(document).on("click",".classcard",function(e){
         let classobject=$(this).data('classobject');
         $("#hiddenSelectedCourseID").val(classobject['id']);
         let x=getClassdetailsAreaHTML(classobject);
         $("#classdetailsarea").html(x);
         let sessionid=$("#ddlclass").val();
         let classid=classobject['id'];
         let facid=$("#hiddenFacId").val();
         let ondate=$("#dtpondate").val();
         if(sessionid!=-1)
         {
            fetchStudentList(sessionid,classid,facid,ondate);
         }
        
    });
    $(document).on("click",".cbpresent",function(e){
      let ispresent=this.checked;     
      if(ispresent)
      {
        ispresent="YES";
      } 
      else{
        ispresent="NO";
      }
      let studentid=$(this).data('studentid');
      let courseid=$("#hiddenSelectedCourseID").val();
      let facultyid= $("#hiddenFacId").val();
      let sessionid=$("#ddlclass").val();
      let ondate=$("#dtpondate").val();
      saveAttendance(studentid,courseid,facultyid,sessionid,ondate,ispresent);
    });
    $(document).on("change","#dtpondate",function(e){
      //alert($("#dtpondate").val());
      //now load the studentlist on this day
         loadTakeAttendance();
    });
    $(document).on("click","#btnLoadDeafulterList",function(){
        //alert("CLICKED");
        loadDefaulter();
        
    })
    $(document).on("keydown","#txtCutOff",function(event){
        // Get the key code of the pressed key
        const keyCode = event.keyCode || event.which;

        // Allow only numbers, decimal point, backspace, delete, arrow keys, and decimal point
        if (!(/[0-9\b\.\t]/.test(String.fromCharCode(keyCode)) || // Numbers, backspace, tab, and decimal point
            keyCode === 46 || // Delete key
            (keyCode >= 37 && keyCode <= 40))) { // Arrow keys
            event.preventDefault(); // Prevent the default action
        }

        // Allow only one decimal point
        const value = this.value;
        if (keyCode === 46 && value.indexOf('.') !== -1) {
            event.preventDefault();
        }
    })
    $(document).on("click","#btnSendEmail",function(){
        let sessionid=$("#ddlclass").val();//sorry for the name
        let classid=$("#hiddenSelectedCourseID").val();
        let facid=$("#hiddenFacId").val();
        let cutoff=$("#txtCutOff").val();
        // Check if data is a number
        if (cutoff!='' && !isNaN(cutoff)) {
            sendEmails(sessionid,classid,facid,cutoff);
        } else {
           alert('INVALID INPUT');
        }
    })
    //loadTakeAttendance()
    $(document).on("click","#linkTakeAttendance",function(){
        loadTakeAttendance();
    })
    $(document).on("click","#linkEmailAttendanceShortage",function(){
       let x=getSendEmailPanel();
       $("#studentlistarea").html(x);
    })
    
    $(document).on("click","#linkReport",function(){
        /*let sessionid=$("#ddlclass").val();//sorry for the name
        let classid=$("#hiddenSelectedCourseID").val();
        let facid=$("#hiddenFacId").val();
        downloadCSV(sessionid,classid,facid);*/
        let x=getReportPanel();
        $("#studentlistarea").html(x);
     })
     $(document).on("click","#btnSummary",function(){
        let sessionid=$("#ddlclass").val();//sorry for the name
        let classid=$("#hiddenSelectedCourseID").val();
        let facid=$("#hiddenFacId").val();
        downloadCSV(sessionid,classid,facid,'downloadSummaryReport');
     })
     $(document).on("click","#btnDetailed",function(){
        let sessionid=$("#ddlclass").val();//sorry for the name
        let classid=$("#hiddenSelectedCourseID").val();
        let facid=$("#hiddenFacId").val();
        downloadCSV(sessionid,classid,facid,'downloadDetailsReport');
     })
});