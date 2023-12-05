function checkIsNull(value) {
    return value === "" || value === undefined || value === null ? true : false;
}
const URL = "https://fir-1c7de-default-rtdb.firebaseio.com/libraryManagment";

function loginUser() {
    if (checkIsNull($("#emailId").val()) || checkIsNull($("#pwdId").val())) {
        alert("Please fill Required Data");

    } else {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/libraryUserRegister.json",
            success: function (response) {
                let loginUserList = [];
                for (let i in response) {
                    let data = response[i];
                    data["userId"] = i;
                    loginUserList.push(data);
                }
                let isValid = false;
                for (let i = 0; i < loginUserList.length; i++) {
                    if (loginUserList[i].emailId == $("#emailId").val() && loginUserList[i].password == $("#pwdId").val()) {
                        isValid = true;
                        if (loginUserList[i].userType === "Librarian") {
                            localStorage.setItem("userName", "LIBRARIAN");
                        } else {
                            localStorage.setItem("userName", "STUDENT");
                        }
                        localStorage.setItem("userId", loginUserList[i].userId);
                        localStorage.setItem("userData", JSON.stringify(loginUserList[i]));

                        $("#emailId").val('');
                        window.location.href = "libraryManagment.html";

                    }
                }
                if (!isValid) {
                    alert("User not found");
                }

            }, error: function (error) {
                alert("Failed");
            }
        });
    }
}
function registerUser() {

    if (checkIsNull($("#userNameId").val()) || checkIsNull($("#addressId").val()) || checkIsNull($("#userEmailId").val())
        || checkIsNull($("#passwordId").val()) || checkIsNull($("#contactId").val()) ||
        checkIsNull($("input[name='userTypeRadio']:checked").val())) {

        alert("Please fill all the details");

    } else {
        isUserExist();
    }
}
function isUserExist() {
    $.ajax({
        type: 'get',
        contentType: "application/json",
        dataType: 'json',
        cache: false,
        url: URL + "/libraryUserRegister.json",
        success: function (response) {
            let loginUserList = [];
            for (let i in response) {
                let data = response[i];
                data["userId"] = i;
                loginUserList.push(data);
            }
            for (let i = 0; i < loginUserList.length; i++) {
                if (loginUserList[i].emailId == $("#userEmailId").val()) {

                    alert("Email is already Registered!!!!");
                    return false;
                }
            }
            let requestBody = {
                "memberName": $("#userNameId").val(),
                "memberAddress": $("#addressId").val(),
                "emailId": $("#userEmailId").val(),
                "password": $("#passwordId").val(),
                "contactNum": $("#contactId").val(),
                "address": $("#addressId").val(),
                "gender": $("input[name='genderRadio']:checked").val(),
                "userType": $("input[name='userTypeRadio']:checked").val()
            }
            if ($("input[name='userTypeRadio']:checked").val() === "Librarian") {
                requestBody['empRegNo'] = $("#empRegNo").val();

            } else if ($("input[name='userTypeRadio']:checked").val() === "Student") {
                requestBody['parentsName'] = $("#parentsNameId").val();
                requestBody['studentRegNo'] = $("#stdRegNo").val();
                requestBody['departmenId'] = $("#departmenId").val();
            }
            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/libraryUserRegister.json",
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $('#regModelId').modal('hide');
                    alert("Registerd Successfully!!!");
                }, error: function (error) {
                    alert("Failed");
                }
            });

        }, error: function (error) {
            alert("Failed");
        }
    });
}

$(document).ready(function () {
    $("#librarianDivId").hide();
    $("#studentId").hide();

    $('#regModelId').on('hidden.bs.modal', function (e) {
        $("#userNameId").val("");
        $("#addressId").val("");
        $("#userEmailId").val("");
        $("#passwordId").val("");
        $("#contactId").val("");
    })
    $('input[type=radio]').click(function () {
        if (this.value === "Librarian") {
            $("#librarianDivId").show();
            $("#studentId").hide();
        } else if (this.value === "Student") {
            $("#studentId").show();
            $("#librarianDivId").hide();
        }
    });
})
