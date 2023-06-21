document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#compose-submit').addEventListener('click', submit_mail)
    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {
    const recepient_e = document.querySelector('#compose-recipients');
    const subject_e = document.querySelector('#compose-subject');
    const body_e = document.querySelector('#compose-body');
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#error-message').style.display = 'none';

    // Clear out composition fields
    recepient_e.value = '';
    subject_e.value = '';
    body_e.value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email').style.display = 'none';
    document.querySelector('#tbody-emails').innerHTML = '';
    // Show the mailbox name
    //document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    let path = '/emails/' + mailbox;
    fetch(path)
        .then(response => response.json())
        .then(emails => {
            // Вивести листи в консоль
            console.log(emails);
            document.querySelector('#title-mails-list').innerHTML = `<i class="ti-email mr-2"></i>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)} ${emails.length} unread emails`;
            // ... зробити з листами щось інше ...
            emails.forEach((mail, ind) => {
                const element = document.createElement('tr');
                element.className = (mail.read ? "read" : "unread")
                element.dataset.mailId = mail.id;
                let name_sender = '';
                if (mailbox !== 'sent') {
                    name_sender = mail.sender;
                } else {
                    name_sender = mail.recipients[0];
                }
                const innerHtml = `
                <!-- label -->
                <td class="pl-3">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="cst${ind}"/>
                        <label class="custom-control-label" for="cst${ind}">&nbsp;</label>
                    </div>
                </td>
                <!-- star -->
                <td><i class="fa fa-star text-warning"></i></td>
                <!-- User -->
                <td>
                    <span class="mb-0 text-muted font-light">${name_sender}</span>
                </td>
                <!-- Message -->
                <td>
                    <a class="link" href="javascript: void(0)">
                        <span class="badge badge-pill text-white font-medium badge-danger mr-2">Work</span><span
                            class="font-light text-dark"> ${mail.subject.slice(0, 25)}</span>
                    </a>
                </td>
                <!-- Attachment -->
                <td><i class="fa fa-paperclip text-muted"></i></td>
                <!-- Time -->
                <td class="text-muted font-light">${mail.timestamp}</td>
            `
                element.innerHTML = innerHtml;
                element.addEventListener('click', () => open_mail(mail.id))
                document.querySelector('#tbody-emails').append(element);
            })
        });

}

function open_mail(id) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email').style.display = 'block';
    let path = '/emails/' + id;
    fetch(path)
        .then(response => response.json())
        .then(email => {
            document.querySelector('#mail-sender').innerHTML = email.sender;
            document.querySelector('#mail-subject').innerHTML = email.subject;
            document.querySelector('#mail-body').innerHTML = email.body;
            document.querySelector('#mail-date').innerHTML = email.timestamp;
            document.querySelector('#mail-recipient').innerHTML = email.recipients[0];
            document.querySelector('#mail-delete').addEventListener('click', ()=>{
                fetch(path, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: !email.archived
                    })
                }).then(response => load_mailbox('archive'))
            })
        })
    fetch(path, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    }).then()

}

function submit_mail() {
    const recepient_e = document.querySelector('#compose-recipients');
    const subject_e = document.querySelector('#compose-subject');
    const body_e = document.querySelector('#compose-body');
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recepient_e.value,
            subject: subject_e.value,
            body: body_e.value
        })
    })
        .then(response => response.json())
        .then(result => {
            // Вивести результат в консоль
            const error_e = document.querySelector('#error-message');
            if ("error" in result) {
                console.log(result.error);
                error_e.innerHTML = result.error;
                error_e.style.display = 'block';
            } else {
                error_e.innerHTML = '';
                error_e.style.display = 'none';
                load_mailbox('sent')
            }

        });
}