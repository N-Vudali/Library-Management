var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
    const URL = "https://fir-1c7de-default-rtdb.firebaseio.com/libraryManagment";
    $scope.selectedBookDetails = {};
    $("#viewBookDivId").show();
    $("#biilingId").hide();
    $("#studentDetilsId").hide();
    $scope.viewOrderTableData = [];
    $scope.userName = localStorage.getItem("userName");
    $scope.userId = localStorage.getItem("userId");
    getBookList();
    $scope.placeOrder = function (data) {
        $scope.selectedBookDetails = data;
    }
    $scope.totalBarrowCost = function () {
        let cost = Number($("#noOfDays").val()) * Number($("#priceId").val());
        $("#barrowCostId").val(cost);
    }
    $scope.barrowBook = function () {

        let reqstBody = {
            "noOfDays": $("#noOfDays").val(),
            "title": $scope.selectedBookDetails.title,
            "bookingDate": $("#bookingDateId").val(),
            "status": "pending",
            "cost": $("#barrowCostId").val(),
            "userId": $scope.userId,
            "ownerId": $scope.selectedBookDetails.ownerId,
            "authorNameId": $scope.selectedBookDetails.authorNameId,
            "return": "pending"
        };
        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/borrowBooks.json",
            data: JSON.stringify(reqstBody),
            success: function (response) {
                $('#barrowBookModelId').modal('hide');
                $scope.switchMenu("PAYMENT", "billingTabId");
                alert("Data submitted Successfully!!!");
            }, error: function (error) {
                alert("Failed");
            }
        });
    }
    $scope.getBookingData = function (type) {
        $scope.viewOrderTableData = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/borrowBooks.json",
            success: function (response) {
                let vechBookList = [];
                for (let i in response) {
                    let data = response[i];
                    data["bookingId"] = i;
                    vechBookList.push(data);
                }
                if ($scope.userName == 'LIBRARIAN') {
                    $scope.viewOrderTableData = vechBookList?.filter(function (obj) {
                        return obj.ownerId === $scope.userId && obj.status != "pending";
                    });
                } else {
                    $scope.viewOrderTableData = vechBookList?.filter(function (obj) {
                        if ($scope.userId === obj.userId) {
                            if (type == "PAYMENT") {
                                return obj.status === "pending";
                            } else {
                                return obj.status != "pending";
                            }
                        }
                    })
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Failed");
            }
        });
    }
    $scope.getOrderData = function (data) {
        $("#ammountId").val(data.cost);
        $scope.selectedBookDetails = data;

    }
    $scope.payBill = function () {
        if ($("#paymentModeId").val() == "") {
            alert("Please select payment mode");
        } else {
            let requestBody = {
                "status": $("#paymentModeId").val()
            }
            $.ajax({
                type: 'patch',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/borrowBooks/" + $scope.selectedBookDetails.bookingId + ".json",
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $('#processToPayModalId').modal('hide');
                    $scope.getBookingData("PAYMENT");
                    alert("Payment Successfully!!!");
                }, error: function (error) {
                    alert("Failed");
                }
            });
        }
    }

    function getBookList() {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addNewBook.json",
            success: function (response) {
                $scope.bookList = [];
                for (let i in response) {
                    let data = response[i];
                    data["newBookId"] = i;
                    $scope.bookList.push(data);
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Failed");
            }
        });
    }
    $scope.addEditBook = function () {
        let method_type = 'post';
        let http_url = '/addNewBook.json';
        let msg = "A new book has added Successfully!!!";
        if ($scope.isEdit) {
            method_type = 'patch';
            http_url = '/addNewBook/' + $scope.selectedBookDetails.newBookId + '.json';
            msg = "Book details has updated Successfully!!!"
        }
        let requestBody = {
            //"imgUrl": $scope.bookImg,
            "price": $("#pricePerDayId").val(),
            "title": $("#bookNameId").val(),
            "ownerId": $scope.userId,
            "authorNameId": $("#authorNameId").val(),
            "yop": new Date($("#yop").val()).toISOString().split("T")[0],
            "bookLibraryId": $("#bookLibraryId").val()
        };
        $.ajax({
            type: method_type,
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + http_url,
            data: JSON.stringify(requestBody),
            success: function (response) {
                getBookList();
                alert(msg);
                $("#pricePerDayId").val('');
                //$('#bookImgId').next('.custom-file-label').html("Upload Book Photo");
                $("#bookNameId").val('');
                $("#authorNameId").val('');
                $("#yop").val('');
                $("#bookLibraryId").val('')
                $('#bookAddModelId').modal('hide');


            }, error: function (error) {
                alert("Failed");
            }
        });
    }
    $scope.editBookModel = function (details) {
        $scope.selectedBookDetails = details;
        $scope.modelTitle = "Edit Book Details"
        $scope.isEdit = true;
        $("#pricePerDayId").val(details.price);
        $("#bookNameId").val(details.title);
        $("#authorNameId").val(details.authorNameId);
        $("#yop").val(details.yop);
        $("#bookLibraryId").val(details.bookLibraryId);
    }
    $scope.addBookModel = function () {
        $scope.modelTitle = 'Add Book Details';
        $scope.isEdit = false;
        $("#pricePerDayId").val("");
        $("#bookNameId").val("");
        $("#authorNameId").val("");
        $("#yop").val("");
        $("#bookLibraryId").val("")
    }

    $scope.removeBook = function (data) {
        $.ajax({
            type: 'delete',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addNewBook/" + data.newBookId + ".json",
            success: function (response) {
                getBookList();
                alert("Removed successfuly !!!");
            }, error: function (error) {
                alert("Failed");
            }
        });

    }
    $scope.returnBook = function (data) {
        let requestBody = {
            "return": "Completed"
        }
        $.ajax({
            type: 'patch',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/borrowBooks/" + data.bookingId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                $('#processToPayModalId').modal('hide');
                $scope.getBookingData("PAYMENT");
                alert("Returned Successfully!!!");
            }, error: function (error) {
                alert("Failed");
            }
        });

    }
    $scope.logout = function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "loginRegLibrary.html";
    }
    function getStudentData() {

        $scope.studentDetails = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/libraryUserRegister.json",
            success: function (response) {
                let userList = [];
                for (let i in response) {
                    let data = response[i];
                    data["userId"] = i;
                    userList.push(data);
                }
                $scope.studentDetails = userList?.filter(function (obj) {
                    return obj.userType === 'Student';
                });
                $scope.$apply();
            }, error: function (error) {
                alert("Failed");
            }
        });
    }
    $scope.switchMenu = function (type, id) {
        $(".menuCls").removeClass("active");
        $('#' + id).addClass("active");
        $("#viewBookDivId").hide();
        $("#biilingId").hide();
        $("#studentDetilsId").hide();
        if (type == "MENU") {
            $("#viewBookDivId").show();
            getBookList();
        } else if (type == "PAYMENT") {
            $("#biilingId").show();
            $scope.getBookingData("PAYMENT");
        } else if (type == "HISTORY") {
            $("#biilingId").show();
            $scope.getBookingData("HISTORY");
        } else if (type == "STUDENT_DETAILS") {
            $("#studentDetilsId").show();
            getStudentData();
        }
    }
    $(document).ready(function () {
        $('#barrowBookModelId').on('hidden.bs.modal', function (e) {
            $("#barrowCostId").val("");
            $("#noOfDays").val("");
            $("#bookingDateId").val("");
            $("#barrowCostId").val("");
        })
        // $('#bookImgId').on('change', function () {
        //     var fileReader = new FileReader();
        //     fileReader.onload = function () {
        //         $scope.bookImg = fileReader.result;  // data <-- in this var you have the file data in Base64 format
        //     };
        //     fileReader.readAsDataURL($('#bookImgId').prop('files')[0]);
        //     var file = $('#bookImgId')[0].files[0].name;
        //     $(this).next('.custom-file-label').html(file);
        // });
    });
});
