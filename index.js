function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    debugger;
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    debugger;
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

function createTable(rows, columns) {
    debugger;
    var tbl = document.getElementById('product-grid');
    tbl.innerHTML = "";
    for (var i = 0; i < rows; i++) {
        var tr = tbl.insertRow();
        for (var j = 0; j < columns; j++) {
            var td = tr.insertCell();
            td.id = 'td' + i + j;
            td.setAttribute("ondrop", "drop(event)");
            td.setAttribute("ondragover", "allowDrop(event)");
        }
    }
}

function loadProducts() {
    debugger;
    var id = window.parent.Xrm.Page.data.entity.getId();
    var fetchXml = '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
        '<entity name="inf_backplateitems">' +
        '<attribute name="inf_backplateitemsid" />' +
        '<attribute name="inf_name" />' +
        '<attribute name="inf_row" />' +
        '<attribute name="inf_columns" />' +
        '<attribute name="inf_productsid" />' +
        '<order attribute="inf_name" descending="false" />' +
        '<filter type="and">' +
        '<condition attribute="inf_binid" operator="eq" value="' + id + '"/>' +
        '</filter>' +
        '</entity>' +
        '</fetch>';
    var options = "?fetchXml=" + encodeURIComponent(fetchXml);
    window.parent.Xrm.WebApi.retrieveMultipleRecords("inf_backplateitems", options).then(function (results) {
        for (var i = 0; i < results.entities.length; i++) {
            window.products = results.entities;
            RetrieveProduct(results.entities[i]["_inf_productsid_value"], results.entities[i]);
        }
    }, function (error) {
        console.log(error.message);
    });
}


function RetrieveProduct(productId, backplateItem) {
    window.parent.Xrm.WebApi.retrieveRecord("product", productId, "?$select=productid,productnumber,entityimage,name,entityimage_url").then(function (product) {
        CreateHTMLElement(product, backplateItem);

    });
}

function CreateHTMLElement(product, backplateItem) {
    //Create Div Tag
    var productDiv = document.getElementById("products");
    var div = document.createElement("div");
    div.id = "drag" + product["productnumber"];
    div.draggable = "true";
    div.setAttribute("ondragstart", "drag(event)");
    div.classList.add("card");

    //create Image tag
    var img = document.createElement("img");
    img.draggable = "false";
    var src;
    if (product["entityimage_url"] == null) {
        src = "../WebResources/inf_default_img.png"
    }
    else {
        src = ".." + product["entityimage_url"];
    }
    img.src = "../" + src;

    //create h4 tag
    var h4 = document.createElement("h4");
    h4.id = product["productid"];
    h4.draggable = "false";
    h4.appendChild(document.createTextNode(product["productnumber"]));

    //Append Image and h4
    div.appendChild(img);
    div.appendChild(h4);

    if (!backplateItem.hasOwnProperty("inf_row")) {
        productDiv.appendChild(div);
    }
    else {
        var td = document.getElementById("td" + backplateItem["inf_row"] + backplateItem["inf_columns"]);
        td.appendChild(div);
    }
}

function saveBackplate() {
    ShowLoader("Saving...");
    var tbl = document.getElementById('product-grid'),
        tds = tbl.getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
        debugger;
        if (tds[i] != "") {
            var tdid = tds[i].id;
            var id = tds[i].getElementsByTagName("h4")[0] != null ? tds[i].getElementsByTagName("h4")[0].id : null;
            if (id != null) {
                var item = search(id, window.products);
                window.parent.Xrm.WebApi.updateRecord("inf_backplateitems", item.inf_backplateitemsid, { "inf_row": tdid.substr(2, 1), "inf_columns": tdid.substr(3, 1) });
            }
        }
    }
    HideLoader();
}

function search(id, products) {
    for (var i = 0; i < products.length; i++) {
        if (products[i]._inf_productsid_value === id) {
            return products[i];
        }
    }
}

function ShowLoader(msg) {

    //Global Document, the top most document object of CRM page.
    var CRMTopBar = window.parent.top.document.getElementById("crmTopBar");
    var divOverlays = window.parent.top.document.getElementById("overlayDiv");

    //Loading Div
    var loadDiv = document.createElement("div");
    loadDiv.setAttribute('id', 'loadDiv');
    loadDiv.align = 'center';
    var divInnerHTML = "";
    divInnerHTML += "";
    divInnerHTML += "</br>";
    divInnerHTML += "<b>" + msg + "</b>";
    divInnerHTML += "";
    divInnerHTML += "";
    loadDiv.innerHTML = divInnerHTML;
    loadDiv.style.zIndex = '100003';
    loadDiv.style.fontSize = '13px';
    loadDiv.style.top = "50%";
    loadDiv.style.left = "50%";
    loadDiv.style.transform = "translate(-50%,-50%)";
    loadDiv.style.position = 'absolute';
    loadDiv.style.width = '300px'
    loadDiv.style.backgroundColor = "#FFF19D";

    //overlay div
    var overlay = document.createElement("div");
    overlay.setAttribute('id', 'overlayDiv');
    overlay.align = 'center';
    overlay.style.zIndex = '100002';
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = 'black';
    overlay.style.position = 'fixed';
    overlay.style.opacity = '0.075';


    //check if div exist!
    if (window.parent.top.document.getElementById('loadDiv') != null) {
        window.parent.top.document.getElementById('overlayDiv').remove();
        window.parent.top.document.getElementById('loadDiv').remove();
    }
    if (divOverlays == null && CRMTopBar != null) {
        CRMTopBar.parentNode.insertBefore(overlay, CRMTopBar);
        CRMTopBar.parentNode.insertBefore(loadDiv, overlay);
    }

    window.parent.top.document.getElementById('overlayDiv').style.visibility = 'block';
    window.parent.top.document.getElementById('loadDiv').style.visibility = 'block';
}

function HideLoader() {

    if (window.parent.top.document.getElementById('loadDiv') != null) {
        window.parent.top.document.getElementById('loadDiv').remove();
        window.parent.top.document.getElementById('overlayDiv').remove();
    }
}
    //div.ondragstart = function () { drag(ev) };    // h4.addEventListener("ondragstart", "drag");
    //img.addEventListener("ondragstart", "drag");
    //img.ondragstart("ondragstart", "drag");