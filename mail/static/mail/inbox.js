document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
        // By default, load the inbox
        load_mailbox('inbox');
    });

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}
function send_mail(){
    
      const recipients=document.querySelector('#compose-recipients').value;
      const subject=document.querySelector('#compose-subject').value;
      const body=document.querySelector('#compose-body').value;

      // Send mail
      fetch('/emails',{
        method:'POST',
        body:JSON.stringify({
          recipients:recipients,
          subject:subject,
          body:body,
        })
      })
      .then(response=>response.json())
      .then(result=>{
        console.log(result);
      })
      .catch(error=>{
        console.log('Error:',error);
    });
    return false;
}


function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#detail-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#email-title').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {   
        //Build an array containing mails
        var mail=[]
        var k=1
        mail[0]=["sender","subject","timestamp"]
        for(var i=0;i<emails.length;i++){
          var elem=[];
          ['sender','subject','timestamp','read'].forEach(element=>{
            elem.push(emails[i][element]);
          });
          mail[k]=elem
          k++
        }
        //Create a HTML table element
        var table=document.createElement("Table");
        table.border="1";

        //Get the count of columns
        var columnCount=mail[0].length;

        //Add header row
        var row=table.insertRow(-1);
        for(var i=0;i<columnCount;i++){
          var headerCell=document.createElement("TH");
          headerCell.innerHTML=mail[0][i];
          row.appendChild(headerCell);
        }

        //Add the rows
        for(var i=1; i<mail.length; i++){
          row=table.insertRow(-1);
          //checking whther the mail is read or not
          if(emails.read==true){
            $('tr').addId("read")
          }
          if(mail[i][3]){
            row.setAttribute("id","read");
          }
          else{
            row.setAttribute("id","unread");
          }
          for(var j=0; j<columnCount; j++){
            var cell=row.insertCell(-1);
            cell.innerHTML=mail[i][j];
          }
        }
        var dvTable = document.getElementById("dvTable");
        dvTable.innerHTML="";
        dvTable.appendChild(table);

        //mark as read on clicking the row
        //and call the view function to view email
        $('tr').click(function () {
           text=$(this).index()
           text-=1
           id=emails[text].id
           fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
           view(id);
        });   
    });
}

function view(mail){
  //show only the detail view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'block';

  fetch(`/emails/${mail}`)
  .then(response => response.json())
  .then(emails => {

      if(emails.archived==true){
       var ar=document.getElementById("archive")
       ar.innerHTML="Unarchive";
       $("#archive").click(function(){
        archive(emails.archived,mail)
       })
      }
      else{
       var ar=document.getElementById("archive")
       ar.innerHTML="Archive";
       $("#archive").click(function(){
        archive(emails.archived,mail)
       })
      }

      //call reply function on clicking reply button
      $("#reply").click(function(){
        reply(mail)
      })

      var send=document.getElementById("sender-email");
      send.innerHTML=emails.sender;

      // Print email
      var msg=["sender","subject","body","timestamp","receiver"]

      //Create a HTML table element
      var table=document.createElement("Table");
      table.border="1";
      
      //create a row for each element
      ['sender','subject','timestamp','recipients','body'].forEach(element=>{
        var row=table.insertRow(-1);
        for(var j=0; j<2; j++){
          var cell=row.insertCell(-1);
          if(j==0)
           cell.innerHTML=element;
          else
           cell.innerHTML=emails[element];
        }
      });
        
      var view = document.getElementById("view-table");
      view.innerHTML="";
      view.appendChild(table);
      return false;
  });
}

//archive function
function archive(archive,mail){
  //archiving
  if(archive==false){
  fetch(`/emails/${mail}`, {
    method: 'PUT',
    body: JSON.stringify({
         archived: true
    })
  })
  //loading mailbox after archiving
  load_mailbox('inbox');
  return false;
 }
 //unarchiving
 else{
  fetch(`/emails/${mail}`, {
    method: 'PUT',
    body: JSON.stringify({
         archived: false
    })
  })
  //loading mailbox after unarchiving
  load_mailbox('inbox');
  return false;
 }
}

function reply(mail){
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#detail-view').style.display = 'none';

  // Clear out composition fields
  fetch(`/emails/${mail}`)
  .then(response => response.json())
  .then(emails => {
  document.querySelector('#compose-recipients').value = emails.sender;
  document.querySelector('#compose-subject').value = 'Re:';
  document.querySelector('#compose-body').value = '\n\n\n-------------On '+emails.timestamp+' '+emails.sender+' '+'wrote:\n'+emails.body;
  });
}
