const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click',() =>{
        nav.classList.add('active');
    })
}
if (close) {
    close.addEventListener('click',() =>{
        nav.classList.remove('active');
    })
}

// /* Bottom to Top button */

// const toTop = document.querySelector(".to-top");

// window.addEventListener("scroll", () => {
//     if(window.pageYOffset > 100) {
//         toTop.classList.add("active");
//     }else{
//         toTop.classList.remove("active");
//     }
// })


//For alert popup to appear after cart product is added.
let popupAppear = ()=>{
    //console.log('Working');
    let lottie = document.querySelector('#lottieAddToCart')
    document.querySelector('.alert-added-to-cart').classList.add('alert-added-to-cart-appear');
    let productCard = document.querySelectorAll('.pro-container')
    for (let i = 0; i < productCard.length; i++) {
        productCard[i].style.visibility = 'hidden';
      }
      
    lottie.play()
        setTimeout(()=>{
            document.querySelector('.alert-added-to-cart').classList.remove('alert-added-to-cart-appear');
            let productCard = document.querySelectorAll('.pro-container')
            for (let i = 0; i < productCard.length; i++) {
                productCard[i].style.visibility = 'visible';
            }
            lottie.stop()
        },2500)
}

//function to add a product to cart from product card.
let addToCart = (productId)=>{
    $.ajax({
        url: '/add-to-cart/' + productId,
        method: 'get',
        success: (response)=>{
            popupAppear();
            document.getElementById('cartCountBadge').innerHTML = parseInt(document.getElementById('cartCountBadge').innerHTML) + 1;
        }
    })
}

//function to add a product to cart from view-product-details page.
let addToCartFromProPage = (productId)=>{
    let size = document.querySelector('#productSizeSelection').value
    let quantity = document.querySelector('#productQuantitySelection').value

    // console.log('Size = '+size+' ;  Quantity = '+quantity);

    $.ajax({
        url: '/add-to-cart/' + productId,
        data: {
            size : size,
            quantity : quantity
        },
        method : 'post',
        success : (response)=>{
            popupAppear();
            document.getElementById('cartCountBadge').innerHTML = parseInt(document.getElementById('cartCountBadge').innerHTML) + parseInt(quantity)
            // setTimeout(() => {
            //     location.reload()
            // }, 2500);
        }
    })
}

//change Product Quantity when user clicks + and - buttons in cart page.
let changeProQuantity = (userId, cartId, productId, firstAddedTime, productSize, count)=>{
    
    let qty = parseInt(document.getElementById(firstAddedTime).value)

    $.ajax({
        url : '/change-product-quantity',
        data : {
            user : userId,
            cart : cartId,
            product : productId,
            count : count,
            quantity : qty,
            time : parseInt(firstAddedTime),
            size : productSize
        },
        method : 'post',
        success : (response)=>{
            //if there is no product being removed, change count and change total through ajax.
            //if product is removed, as page is then reloaded, there is no need for changing via
            //ajax, the count will be automatically changed after refresh
            if(response.removeProduct){
                // alert('Product removed from cart!')
                // location.reload()
                removedFromCartPopupAppear()
            }else { 
                
                document.getElementById(firstAddedTime).value = qty+parseInt(count);
                document.getElementById('cartCountBadge').innerHTML = parseInt(document.getElementById('cartCountBadge').innerHTML)+parseInt(count)
                document.getElementById('sumTotalId').innerHTML = response.total.sumTotal;
                document.getElementById('taxAmountId').innerHTML = response.total.taxAmount;
                document.getElementById('grandTotalId').innerHTML = response.total.grandTotal;
            }
        }
    })
}

//function to remove a product from cart

let removeCartProduct = (cartId, firstAddedTime, productName)=>{
    let confirmation = confirm("Are you sure you want to remove ' "+productName+" ' from cart?");

    if(confirmation == true){
        $.ajax({
            url : '/remove-cart-product',
            method : 'post',
            data : {
                cart : cartId,
                time : firstAddedTime
            },
            success : (response)=>{
                if(response){
                    // alert('Product removed from cart!')
                    // location.reload()
                    removedFromCartPopupAppear()
                }
            }
        })
    }
}

//function to add product to wishlist from product card

let addToWishlist = (productId)=>{
    $.ajax({
        url: '/add-to-wishlist/' + productId,
        method: 'get',
        success: (response)=>{
            
            wishlistPopupAppear();
            console.log(response);
            if(response.status){
                document.getElementById('wishlistCountBadge').innerHTML = parseInt(document.getElementById('wishlistCountBadge').innerHTML) + 1;
            }
        }
    })
}

//function to add product to wishlist from product details page

let addToWishlistFromProPage = (productId)=>{
    let size = document.querySelector('#productSizeSelection').value
    $.ajax({
        url: '/add-to-wishlist/' + productId,
        method: 'post',
        data : {
            size : size
        },
        success: (response)=>{
            console.log(response);
            wishlistPopupAppear();
            document.getElementById('wishlistCountBadge').innerHTML = parseInt(document.getElementById('wishlistCountBadge').innerHTML) + 1;
        }
    })
}

//added to wishlist popup

let wishlistPopupAppear = ()=>{
    //console.log('Working');
    let lottie = document.querySelector('#lottieAddToWishlist')
    document.querySelector('.alert-added-to-wishlist').classList.add('alert-added-to-wishlist-appear');
    let productCard = document.querySelectorAll('.pro-container')
    for (let i = 0; i < productCard.length; i++) {
        productCard[i].style.visibility = 'hidden';
      }
      
    lottie.play()
        setTimeout(()=>{
            document.querySelector('.alert-added-to-wishlist').classList.remove('alert-added-to-wishlist-appear');
            let productCard = document.querySelectorAll('.pro-container')
            for (let i = 0; i < productCard.length; i++) {
                productCard[i].style.visibility = 'visible';
            }
            lottie.stop()
        },2500)
}


// Move wishlisted product to cart 
        //and in the process, remove the product from wishlist.

let moveToCartFromWishlist = (wishlistId, size, item, time)=>{
    $.ajax({
        url: '/move-to-cart-from-wishlist',
        data: {
            wishlistId: wishlistId,
            size : size,
            item: item,
            time: time,
        },
        method:'post',
        success: (response)=>{
            if(response.status){
                // alert('Product added to cart!')
                // location.reload()
                movedFromWishlistPopupAppear()
            }
        }
    })
}

//to remove a product from wishlist

let removeProductFromWishlist = (wishlistId, productAddedTime)=>{
    $.ajax({
        url: '/remove-from-wishlist',
        method: 'post',
        data: {
            wishlistId: wishlistId,
            time: productAddedTime
        },
        success: (response)=>{
            if(response.status){
                // alert('Product removed from wishlist!')
                // location.reload()
                removedFromWishlistPopupAppear()
            }
        }
    })
}

// function for performing logout

let doLogOut = ()=>{
    let confirmation = confirm("Are you sure you want to Logout ?");

    if(confirmation){
        $.ajax({
            url : "/logout",
            method : 'get',
            success : (response)=>{
                if (response.status) {
                    // alert('You have successfully Logged Out!')
                    // location.href="/"
                    LoggedOutPopupAppear()
                } else {
                    alert('You are already logged out!')
                }
                
            }
        })
    }
}

//function for changing account info of the user.

let changeAccountInfo = (userId)=>{
    let newUserName = document.getElementById('newUserName').value
    let newUserEmail = document.getElementById('newUserEmail').value
    let newUserMobile = document.getElementById('newUserMobile').value
    let newUserAddress = document.getElementById('newUserAddress').value

    let confirmation = confirm("Are you sure you want to change your User Info?");

    if(confirmation){
        $.ajax({
            url : '/change-user-info',
            method : 'post',
            data : {
                newUserName:newUserName,
                newUserEmail:newUserEmail,
                newUserMobile:newUserMobile,
                newUserAddress:newUserAddress
            },
            success : (response)=>{
                if(response.status){
                    alert('data changed successfully!')
                    performLogOut()
                }
                
            }
        })
    }
}

// to change user password

let changeUserPassword = (userId)=>{
    let currentPass = document.getElementById('currentPassword').value
    let newPass = document.getElementById('newPassword').value
    let newPassConfirm = document.getElementById('newPasswordConfirm').value
    let userPasswordErr = document.getElementById('userPasswordErr')

    if(currentPass.length < 8){
        userPasswordErr.innerHTML = 'Current Password is not Valid!'

    } else if (newPass.length < 8){
        userPasswordErr.innerHTML = 'New Password should be of minimum 8 characters!'

    } else if (newPass !== newPassConfirm){
        userPasswordErr.innerHTML = "New Password and New Password Confirm doesn't match!"

    } else {
        $.ajax({
            url : '/change-user-password',
            method : 'post',
            data : {
                userId : userId,
                currentPassword : currentPass,
                newPassword : newPass,
                newPasswordConfirm : newPassConfirm
            },
            success : (response)=>{
                if(response.status === false){
                    userPasswordErr.innerHTML = response.msg

                } else {
                    alert('Password Changed Successfully!')
                    performLogOut();
                }
            }
        })
    }
}

//to logout user
let performLogOut = ()=>{
    $.ajax({
        url : "/logout",
        method : 'get',
        success : (response)=>{
            if (response.status) {
                // alert('You have successfully Logged Out!')
                // location.href="/"
                LoggedOutPopupAppear()
            } else {
                alert('You are already logged out!')
            }
        }
    })
}


// Apply coupon to order in place-order page

let applyCouponDiscount = (userId)=>{
    let couponCode = document.getElementById('discountCoupon').value
    let couponApplyErr = document.getElementById('couponApplyErr')
    let couponApplySuccess = document.getElementById('couponApplySuccess')

    // check if the coupon is valid. If yes, continue with applying updated values.
    //else, send an error message.
    // if(couponCode == ''){
    //     couponApplySuccess.innerHTML = null
    //     couponApplyErr.innerHTML = 'Enter a valid coupon code.'
    // }else {
        $.ajax({
            url: '/check-if-coupon-valid',
            method: 'post',
            data: {
                code: couponCode,
                userId: userId
            },
            // reason for DOM manipulation in both the cases is that if after entering a
            // valid coupon code and then user enters an invalid code, the previousely applied
            // discount amount should be reverted back to normal.
            success: (response)=>{
                if(response.status===false){
                    couponApplySuccess.innerHTML = null
                    couponApplyErr.innerHTML = response.error
                    document.getElementById('sumTotalId').innerHTML = response.totalBeforeDisc;
                    document.getElementById('discAmountId').innerHTML = response.discAmt;
                    document.getElementById('discPercentage').innerHTML = response.discPercentage;
                    document.getElementById('amtAfterDiscount').innerHTML = response.totalAfterDisc;
                    document.getElementById('taxAmountId').innerHTML = response.taxAmt;
                    document.getElementById('grandTotalId').innerHTML = response.grandTotal;
                }else{
                    couponApplyErr.innerHTML = null;
                    couponApplySuccess.innerHTML = response.message;
                    document.getElementById('sumTotalId').innerHTML = response.totalBeforeDisc;
                    document.getElementById('discAmountId').innerHTML = response.discAmt;
                    document.getElementById('discPercentage').innerHTML = response.discPercentage;
                    document.getElementById('amtAfterDiscount').innerHTML = response.totalAfterDisc;
                    document.getElementById('taxAmountId').innerHTML = response.taxAmt;
                    document.getElementById('grandTotalId').innerHTML = response.grandTotal;
                    // alert('Coupon Applied Successfully!')
                    CouponAppliedSuccessPopupAppear()
                }
            }
        })
    // }

}



// let validateName = ()=> {
//     let name = document.getElementById('orderName').value;
//     let nameError = document.getElementById('orderNameErr')

//     if(name.length == 0){
//         nameError.innerHTML = 'Name is required';
//         return false;
//     }
//     if(!name.match(/^[A-Za-z]+ [A-Za-z]+$/)) {
//         nameError.innerHTML = 'Enter Your Full Name';
//         return false;
//     }
//     nameError.innerHTML = '<i class="fa-solid text-success fa-circle-check"></i>';
//         return true;
// }

function validateName() {
    let inputName = document.getElementById('orderName').value;
    let nameError = document.getElementById('orderNameErr')

    var name = inputName.trim();
    var nameParts = name.split(" ");
    var alphabet = /^[a-zA-Z\s]*$/;
    if (nameParts.length < 2) {
        nameError.innerHTML = "Please enter a full name with at least two parts (e.g. first and last name)";
      return false;
    }
    else if(!alphabet.test(name)){
      nameError.innerHTML = "Name should contain only Alphabets";
      return false;
    }

    nameError.innerHTML = '<i class="fa-solid text-success fa-circle-check"></i>';
    return true;
  }
  


let validatePincode = ()=>{
    let pincode = document.getElementById('pincode').value
    let pincodeError = document.getElementById('orderPincodeErr')

    if(pincode.length == 0){
        pincodeError.innerHTML = 'Enter Your Pincode'
        return false;
    }
    if(!pincode.match(/^\d{6}$/)){
        pincodeError.innerHTML = 'Enter Valid 6 digit Pincode'
        return false;
    }
    pincodeError.innerHTML = '<i class="fa-solid text-success fa-circle-check"></i>';
}

let validateMobile = ()=>{
    let mobile = document.getElementById('mobileNo').value
    let mobileErr = document.getElementById('orderMobileErr')

    if(mobile.length == 0){
        mobileErr.innerHTML = 'Enter Your Mobile Number.'
        return false;
    }
    if(!mobile.match(/^\d{10}$/)){
        mobileErr.innerHTML = 'Enter A Valid 10 Digit Mobile Number.'
        return false;
    }
    mobileErr.innerHTML = '<i class="fa-solid text-success fa-circle-check"></i>';
}

let validateAddress = ()=>{
    let address = document.getElementById('address').value
    let addressErr = document.getElementById('orderAddressErr')

    if(address.length == 0){
        addressErr.innerHTML = 'Enter Your Address'
        return false
    }
    if(address.length < 50){
        addressErr.innerHTML = 'Length Of Address Should Be Atleast 50 Letters'
        return false
    }
    addressErr.innerHTML = '<i class="fa-solid text-success fa-circle-check"></i>';
    return true
}

// function validateEmail() {
//     var email = document.getElementById('cemail').value;

//     if(email.length == 0) {
//         emailError.innerHTML = 'Email is required';
//         return false;
//     }
//     if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
//         emailError.innerHTML = 'Email invalid';
//         return false;
//     }
//     emailError.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
//     return true;
// }



// check if user has entered the minimum required characters.
// if the user has selected manual address check for it. else, directly call place-order function.

let checkForErrorsAndPlaceOrder = (userId)=>{

    let checkbox = document.getElementById('selectSavedAddress');

    if(checkbox){
        if(checkbox.checked === false){

            if(!validateName() && !validateAddress() && !validateMobile() && !validatePincode()){
                document.getElementById('placeOrderError').innerHTML = 'Enter All Required Fields To Continue.'
    
            } else {
                placeOrder(userId)
    
            }
    
        } else if (checkbox.checked === true){
            placeOrder(userId)
    
        }
    } else {
        if(!validateName() && !validateAddress() && !validateMobile() && !validatePincode()){
            document.getElementById('placeOrderError').innerHTML = 'Enter All Required Fields To Continue.'

        } else {
            placeOrder(userId)

        }
    }
}

let placeOrder = (userId)=>{
    let cod = document.getElementById('codPayment')
    let online = document.getElementById('onlinePayment')
    let couponCode = document.getElementById('discountCoupon').value
    let savedAddressSelection = document.getElementById('selectSavedAddress')
    let userName = (document.getElementById('orderName').value).toUpperCase()
    let addressLine2 = (document.getElementById('address').value).toUpperCase()
    let addressLine3 = (document.getElementById('pincode').value).toUpperCase()
    let userMobile = (document.getElementById('mobileNo').value)
    let paymentMethod
    let deliveryAddress

    // console.log(cod.checked);
    // console.log(online.checked)

    if(cod.checked===false && online.checked===false){
        document.getElementById('placeOrderError').innerHTML = 'Select a payment method to continue.';
    }else {
        document.getElementById('placeOrderError').innerHTML = null;

        if(savedAddressSelection){
            if(!savedAddressSelection.checked){
                deliveryAddress = addressLine2 + ', ' + addressLine3
            } else {
                deliveryAddress = null
            }
        }else {
            deliveryAddress = addressLine2 + ', ' + addressLine3
        }

        if(cod.checked===true){
            paymentMethod = 'COD'

        } else if (online.checked===true){
            paymentMethod = 'ONLINE'
        }
// function to place order.

        $.ajax({
            url:'/place-order',
            method:'post',
            data:{
                orderName : userName,
                orderMobile : '+91'+userMobile,
                paymentMethod : paymentMethod,
                deliveryAddress : deliveryAddress,
                user: userId,
                coupon : couponCode,
            },
            success : (response)=>{
                if(response.status === false){
                    document.getElementById('placeOrderError').innerHTML = response.error
                } else {
                    document.getElementById('placeOrderError').innerHTML = null;

                    if(response.codPayment === true){
                        // alert('Order Placed Successfully!')
                        location.href = "/order-confirmed/"+response.orderId

                    }else {
                        if(savedAddressSelection){
                            if(!savedAddressSelection.checked){
                                let userInfo = {
                                    userName : userName,
                                    userMobile : userMobile,
                                }
                                razorPayment(response.rzpObj, userInfo, response.orderId)
                            } else {
                                let userInfo = {
                                    userName : document.getElementById('userFullNameForPayment').value,
                                    userEmail : document.getElementById('userEmailIdForPayment').value,
                                    userMobile : parseInt(document.getElementById('userMobileNoForPayment').value)
                                }
                                razorPayment(response.rzpObj, userInfo, response.orderId)
                            }

                        } else {
                            let userInfo = {
                                userName : document.getElementById('userFullNameForPayment').value,
                                userEmail : document.getElementById('userEmailIdForPayment').value,
                                userMobile : parseInt(document.getElementById('userMobileNoForPayment').value)
                            }
                            razorPayment(response.rzpObj, userInfo, response.orderId)
                        }
                        
                    }


                }
            }
        })

    }
}


// function to invoke razor payment page

let razorPayment = (order, userDetail, orderId)=>{
    let options = {
        "key": "rzp_test_hoA57QfXOzGC2S", // Enter the Key ID generated from the Dashboard
        "amount": parseInt(order.amount), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Dressed Up",
        "description": "Transaction Amount Due To Be Paid For Dressed Up",
        "image": "https://i.postimg.cc/sgF1LdWx/download.png",
        "order_id": order.id, 
        "handler": function (response){
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature);
            verifyPayment(response,order,orderId)
        },
        "prefill": {
            "name": userDetail.userName,
            "email": userDetail.userEmail,
            "contact": userDetail.userMobile
        },
        "notes": {
            "Corporate Address": " Imaginary Building, Ernakulam, P.O Kochi, Kerala",
            "Phone" : "+91 9876504321"
        },
        "theme": {
            "color": "#c7b8ff"
        }
      };
  
      var rzp1 = new Razorpay(options);

    //   handler for failed payment
    rzp1.on('payment.failed', function (response){
        // alert(response.error.code);
        // alert(response.error.description);
        // alert(response.error.source);
        // alert(response.error.step);
        // alert(response.error.reason);
        // alert(response.error.metadata.order_id);
        // alert(response.error.metadata.payment_id);
        alert('Payment Failed!');
});
  
// calling the function for new razorpay window to open to accept payment.
      rzp1.open();
  
  }


// function to verify if the payment is confirmed for the user's order

let verifyPayment = (payment, order, orderId)=>{
    $.ajax({
      url: '/verify-payment',
      method: 'post',
      data: {
        payment,
        order
      },
      success: (response)=>{
        if(response.status){
            PaymentSuccessPopupAppear(orderId)
            // alert('Payment Successful!')
            // location.href = "/order-confirmed/" + orderId;
        }else {
          alert('Payment Failed!');
        }
      }
    })
  }


//   To request for OTP

let requestOTP = ()=>{
    let mobileNumber = document.getElementById('phoneForOTP').value

    $.ajax({
        url: 'OTP-login',
        method: 'post',
        data: {
            mobile: mobileNumber
        },
        success: (response)=>{
            if(response.status===true){
                location.href = '/OTP-login-verification/'+mobileNumber

            } else {
                document.getElementById('phoneForOTP').value = ''
                document.getElementById('errorMsgOTP').innerHTML = response.error
            }
        }
    })
}

let verifyOTP = (otp, mobile)=>{
    $.ajax({
        url: '/OTP-login-verification',
        method: 'post',
        data: {
            mobile: mobile,
            otp: otp
        },
        success: (response)=>{
            if(response.status === false){
                document.getElementById('otpfieldErr').innerHTML = response.error

            } else {
                // alert(response.message)
                location.href = "/home"
            }
        }
    })
}

// Function to view all products

let viewAllProducts = ()=>{

    let category = document.getElementById('productCategoryForAllProductsView').value
    let maxPrice = document.getElementById('priceRangeForProducts').value
    let type

    let all = document.getElementById('allWearSelect')
    let top = document.getElementById('topWearSelect')
    let bottom = document.getElementById('bottomWearSelect')
    let other = document.getElementById('otherWearSelect')

    if(all.checked) {
        type = 'all'
    } else if(top.checked) {
        type = 'top'
    } else if(bottom.checked) {
        type = 'bottom'
    } else if (other.checked) {
        type = 'nosize'
    } else {
        type = 'all'
    }

    $.ajax({
        url:'/view-products',
        method: 'post',
        data: {
            category: category,
            maxPrice: maxPrice,
            type: type
        },
        success: (data)=>{
            if(data.status){
                location.href = '/view-products'
            }
        }
    })
}


// let renderDiv = (data)=>{
//     let source   = $("#templateForDisplayingProducts").html();
//     let template = Handlebars.compile(source);

//     let html = template(data)
//     $(".productsDivToRefresh").empty().append(html);
// }


// popup for product removed from cart

let removedFromCartPopupAppear = ()=>{
    //console.log('Working');
    let lottie = document.querySelector('#lottieRemovedFromCart')
    document.querySelector('.alert-removed-from-cart').classList.add('alert-removed-from-cart-appear');
      
    lottie.play()
        setTimeout(()=>{
            document.querySelector('.alert-removed-from-cart').classList.remove('alert-removed-from-cart-appear');
            lottie.stop()
            location.reload()
        },2000)
}

// popup for product added to cart from wishlist

let movedFromWishlistPopupAppear = ()=>{
    //console.log('Working');
    let lottie = document.querySelector('#lottieAddToCart')
    document.querySelector('.alert-added-to-cart').classList.add('alert-added-to-cart-appear');
      
    lottie.play()
        setTimeout(()=>{
            document.querySelector('.alert-added-to-cart').classList.remove('alert-added-to-cart-appear');
            lottie.stop()
            location.reload()
        },2000)
    }


    // popup for product removed from wishlist

let removedFromWishlistPopupAppear = ()=>{
    //console.log('Working');
    let lottie = document.querySelector('#lottieRemovedFromWishlist')
    document.querySelector('.alert-removed-from-wishlist').classList.add('alert-removed-from-wishlist-appear');
      
    lottie.play()
        setTimeout(()=>{
            document.querySelector('.alert-removed-from-wishlist').classList.remove('alert-removed-from-wishlist-appear');
            lottie.stop()
            location.reload()
        },2000)
}


// popup for user logged-out
let LoggedOutPopupAppear = ()=>{
    //console.log('Working');
    let lottie = document.querySelector('#lottieUserLoggedOut')
    document.querySelector('.alert-logged-out').classList.add('alert-logged-out-appear');
      
    lottie.play()
        setTimeout(()=>{
            document.querySelector('.alert-logged-out').classList.remove('alert-logged-out-appear');
            lottie.stop()
            location.href = '/'
        },2000)
    }


// popup for coupon applied successfully
let CouponAppliedSuccessPopupAppear = ()=>{
    let lottie = document.querySelector('#lottieCouponSuccess')
    document.querySelector('.alert-coupon-applied-successfully').classList.add('alert-coupon-applied-successfully-appear');
      
    lottie.play()
        setTimeout(()=>{
            document.querySelector('.alert-coupon-applied-successfully').classList.remove('alert-coupon-applied-successfully-appear');
            lottie.stop()
        },2000)
    }


// payment successful alert card
let PaymentSuccessPopupAppear = (orderId)=>{
    let lottie = document.querySelector('#lottiePaymentSuccess')
    document.querySelector('.alert-payment-success').classList.add('alert-payment-success-appear');
      
    lottie.play()
        setTimeout(()=>{
            document.querySelector('.alert-payment-success').classList.remove('alert-payment-success-appear');
            lottie.stop()
            location.href = "/order-confirmed/" + orderId;
        },2000)
    }