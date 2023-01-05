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
            //console.log(response);
            popupAppear();
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

            setTimeout(() => {
                location.reload()
            }, 2500);
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
                alert('Product removed from cart!')
                location.reload()
            }else {
                console.log(response);
                document.getElementById(firstAddedTime).innerHTML = qty+parseInt(count);
                document.getElementById('sumTotalId').innerHTML = response.total.sumTotal;
                document.getElementById('taxAmountId').innerHTML = response.total.taxAmount;
                document.getElementById('grandTotalId').innerHTML = response.total.grandTotal;
            }
        }
    })
}