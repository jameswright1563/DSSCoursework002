const form = document.getElementById("form")
form.addEventListener("submit", getForm)
function getForm(){
    var title = document.getElementById("title")
    var desc = document.getElementById("description")
    return {title,desc}
}