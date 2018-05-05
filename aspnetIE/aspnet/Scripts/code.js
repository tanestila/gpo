var isPluginEnabled = false;
function MakeXMLSign_NPAPI(dataToSign, certObject) {
    try {
        var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    } catch (err) {
        errormes = "Failed to create CAdESCOM.CPSigner: " + err.number;
        alert(errormes);
        throw errormes;
    }

    if (oSigner) {
        oSigner.Certificate = certObject;
    }
    else {
        errormes = "Failed to create CAdESCOM.CPSigner";
        alert(errormes);
        throw errormes;
    }

    var signMethod = "";
    var digestMethod = "";

    var pubKey = certObject.PublicKey();
    var algo = pubKey.Algorithm;
    var algoOid = algo.Value;
    if (algoOid == "1.2.643.7.1.1.1.1") {   // алгоритм подписи ГОСТ Р 34.10-2012 с ключом 256 бит
        signMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-256";
        digestMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-256";
    }
    else if (algoOid == "1.2.643.7.1.1.1.2") {   // алгоритм подписи ГОСТ Р 34.10-2012 с ключом 512 бит
        signMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-512";
        digestMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-512";
    }
    else if (algoOid == "1.2.643.2.2.19") {  // алгоритм ГОСТ Р 34.10-2001
        signMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411";
        digestMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411";
    }
    else {
        errormes = "Данная страница поддерживает XML подпись сертификатами с алгоритмом ГОСТ Р 34.10-2012, ГОСТ Р 34.10-2001";
        throw errormes;
    }

    var CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED = 0;

    try {
        var oSignedXML = cadesplugin.CreateObject("CAdESCOM.SignedXML");
    } catch (err) {
        alert('Failed to create CAdESCOM.SignedXML: ' + cadesplugin.getLastError(err));
        return;
    }

    oSignedXML.Content = dataToSign;
    oSignedXML.SignatureType = CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED;
    oSignedXML.SignatureMethod = signMethod;
    oSignedXML.DigestMethod = digestMethod;

    var sSignedMessage = "";
    try {
        sSignedMessage = oSignedXML.Sign(oSigner);
    }
    catch (err) {
        errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
        alert(errormes);
        throw errormes;
    }

    return sSignedMessage;
}
function GetSignatureTitleElement() {
    var elementSignatureTitle = null;
    var x = document.getElementsByName("SignatureTitle");

    if (x.length == 0) {
        //elementSignatureTitle = document.getElementById("SignatureTxtBox").parentNode.previousSibling;

        if (elementSignatureTitle.nodeName == "P") {
            return elementSignatureTitle;
        }
    }
    else {
        elementSignatureTitle = x[0];
    }

    return elementSignatureTitle;
}
function LookSign() {
    if (document.getElementById("SignatureTxtBox").hidden)
        document.getElementById("SignatureTxtBox").hidden = false;
    else document.getElementById("SignatureTxtBox").hidden = true;
}
function SignCadesXML_NPAPI(certListBoxId) {
    var certificate = GetCertificate_NPAPI(certListBoxId);
    document.getElementById("SignatureTxtBox").innerHTML = "";
    var dataToSign = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        document.getElementById("DataToSignTxtBox").value ;
    var x = GetSignatureTitleElement();
    try {
        var signature = MakeXMLSign_NPAPI(dataToSign, certificate);
        document.getElementById("SignatureTxtBox").innerHTML = signature;

        if (x != null) {
            x.innerHTML = "Подпись сформирована успешно";
            document.getElementById("LookBtn").hidden = false;
            document.getElementById("DownloadBtn").hidden = false;
        }
    }
    catch (err) {
        if (x != null) {
            x.innerHTML = "Возникла ошибка:";
        }
        document.getElementById("SignatureTxtBox").innerHTML = err;
        document.getElementById("LookBtn").hidden = true;
        document.getElementById("DownloadBtn").hidden = true;
    }
}
function FillCertInfo_NPAPI(certificate, certBoxId) {
    var BoxId;
    var field_prefix;
    if (typeof (certBoxId) == 'undefined' || certBoxId == "CertListBox") {
        BoxId = 'cert_info';
        field_prefix = '';
    } else if (certBoxId == "CertListBox1") {
        BoxId = 'cert_info1';
        field_prefix = 'cert_info1';
    } else if (certBoxId == "CertListBox2") {
        BoxId = 'cert_info2';
        field_prefix = 'cert_info2';
    } else {
        BoxId = certBoxId;
        field_prefix = certBoxId;
    }

    var ValidToDate = new Date(certificate.ValidToDate);
    var ValidFromDate = new Date(certificate.ValidFromDate);
    var IsValid = certificate.IsValid().Result;
    var hasPrivateKey = certificate.HasPrivateKey();
    var Now = new Date();

    var certObj = new CertificateObj(certificate);
    document.getElementById("cert_txt").setAttribute('style', 'visibility: visible;');
    document.getElementById(BoxId).style.display = '';
    document.getElementById(field_prefix + "subject").innerHTML = "Владелец: <b>" + certObj.GetCertName() + "<b>";
    document.getElementById(field_prefix + "issuer").innerHTML = "Издатель: <b>" + certObj.GetIssuer() + "<b>";
    document.getElementById(field_prefix + "from").innerHTML = "Выдан: <b>" + certObj.GetCertFromDate() + "<b>";
    document.getElementById(field_prefix + "till").innerHTML = "Действителен до: <b>" + certObj.GetCertTillDate() + "<b>";
    if (hasPrivateKey) {
        document.getElementById(field_prefix + "provname").innerHTML = "Криптопровайдер: <b>" + certObj.GetPrivateKeyProviderName() + "<b>";
    }
    document.getElementById(field_prefix + "algorithm").innerHTML = "Алгоритм ключа: <b>" + certObj.GetPubKeyAlgorithm() + "<b>";
    if (Now < ValidFromDate) {
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Срок действия не наступил</b></span>";
    } else if (Now > ValidToDate) {
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Срок действия истек</b></span>";
    } else if (!hasPrivateKey) {
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Нет привязки к закрытому ключу</b></span>";
    } else if (!IsValid) {
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Ошибка при проверке цепочки сертификатов</b></span>";
    } else {
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <b> Действителен<b>";
    }
}
function getXmlHttp() {
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
} 

function Verify() {

    // Создаем объект CAdESCOM.SignedXML
    sSignedMessage = document.getElementById("DataToVerifyTxtBox").value;
    var oSignedXML = cadesplugin.CreateObject("CAdESCOM.SignedXML");

    try {
        oSignedXML.Verify(sSignedMessage);
        document.getElementById("verify_msg").innerHTML = "Подпись подтверждена";
    } catch (err) {
        document.getElementById("verify_msg").innerHTML = "Ошибка в проверке подписи : " + cadesplugin.getLastError(err);
    }
    //getInfoFromServer();
}

//function getInfoFromServer() {
//    // 1. Создаём новый объект XMLHttpRequest
//    var xhr = new XMLHttpRequest();

//    // 2. Конфигурируем его: GET-запрос на URL 'phones.json'
//    xhr.open('GET', 'ссылка', false);

//    // 3. Отсылаем запрос
//    xhr.send();

//    // 4. Если код ответа сервера не 200, то это ошибка
//    if (xhr.status != 200) {
//        // обработать ошибку
//        alert(xhr.status + ': ' + xhr.statusText); // пример вывода: 404: Not Found
//    } else {
//        // вывести результат
//        alert(xhr.responseText); // responseText -- текст ответа.
//    }
//}

function GetCertificate_NPAPI(certListBoxId) {
    var e = document.getElementById(certListBoxId);
    var selectedCertID = e.selectedIndex;
    if (selectedCertID == -1) {
        alert("Select certificate");
        return;
    }

    var thumbprint = e.options[selectedCertID].value.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase();
    try {
        var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        oStore.Open();
    } catch (err) {
        alert('Certificate not found');
        return;
    }

    var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
    var oCerts = oStore.Certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);

    if (oCerts.Count == 0) {
        alert("Certificate not found");
        return;
    }
    var oCert = oCerts.Item(1);
    return oCert;
}
function FillCertList_NPAPI(lstId) {
    try {
        var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        oStore.Open();
    }
    catch (ex) {
        alert("Certificate not found");
        return;
    }

    try {
        var lst = document.getElementById(lstId);
        if (!lst)
            return;
    }
    catch (ex) {
        return;
    }
    lst.onchange = onCertificateSelected;
    lst.boxId = lstId;

    var certCnt;

    try {
        certCnt = oStore.Certificates.Count;
        if (certCnt == 0)
            throw "Certificate not found";
    }
    catch (ex) {
        oStore.Close();
        var errormes = document.getElementById("boxdiv").style.display = '';
        return;
    }

    for (var i = 1; i <= certCnt; i++) {
        var cert;
        try {
            cert = oStore.Certificates.Item(i);
        }
        catch (ex) {
            alert("Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
            return;
        }

        var oOpt = document.createElement("OPTION");
        try {
            var certObj = new CertificateObj(cert);
            oOpt.text = certObj.GetCertString();
        }
        catch (ex) {
            alert("Ошибка при получении свойства SubjectName: " + cadesplugin.getLastError(ex));
        }
        try {
            oOpt.value = cert.Thumbprint;
        }
        catch (ex) {
            alert("Ошибка при получении свойства Thumbprint: " + cadesplugin.getLastError(ex));
        }

        lst.options.add(oOpt);
    }

    oStore.Close();
}
function CheckForPlugIn_NPAPI() {
    function VersionCompare_NPAPI(StringVersion, ObjectVersion) {
        if (typeof (ObjectVersion) == "string")
            return -1;
        var arr = StringVersion.split('.');

        if (ObjectVersion.MajorVersion == parseInt(arr[0])) {
            if (ObjectVersion.MinorVersion == parseInt(arr[1])) {
                if (ObjectVersion.BuildVersion == parseInt(arr[2])) {
                    return 0;
                }
                else if (ObjectVersion.BuildVersion < parseInt(arr[2])) {
                    return -1;
                }
            } else if (ObjectVersion.MinorVersion < parseInt(arr[1])) {
                return -1;
            }
        } else if (ObjectVersion.MajorVersion < parseInt(arr[0])) {
            return -1;
        }

        return 1;
    }

    function GetCSPVersion_NPAPI() {
        try {
            var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
        } catch (err) {
            alert('Failed to create CAdESCOM.About: ' + cadesplugin.getLastError(err));
            return;
        }
        var ver = oAbout.CSPVersion("", 75);
        return ver.MajorVersion + "." + ver.MinorVersion + "." + ver.BuildVersion;
    }

    function GetCSPName_NPAPI() {
        var sCSPName = "";
        try {
            var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
            sCSPName = oAbout.CSPName(75);

        } catch (err) {
        }
        return sCSPName;
    }

    function ShowCSPVersion_NPAPI(CurrentPluginVersion) {
        if (typeof (CurrentPluginVersion) != "string") {
            document.getElementById('CSPVersionTxt').innerHTML = "Версия криптопровайдера: " + GetCSPVersion_NPAPI();
        }
        var sCSPName = GetCSPName_NPAPI();
        if (sCSPName != "") {
            document.getElementById('CSPNameTxt').innerHTML = "Криптопровайдер: " + sCSPName;
        }
    }
    function GetLatestVersion_NPAPI(CurrentPluginVersion) {
        var xmlhttp = getXmlHttp();
        xmlhttp.open("GET", "/sites/default/files/products/cades/latest_2_0.txt", true);
        xmlhttp.onreadystatechange = function () {
            var PluginBaseVersion;
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    PluginBaseVersion = xmlhttp.responseText;
                    if (isPluginWorked) { // плагин работает, объекты создаются
                        if (VersionCompare_NPAPI(PluginBaseVersion, CurrentPluginVersion) < 0) {
                            document.getElementById('PlugInEnabledTxt').innerHTML = "Плагин загружен, но есть более свежая версия.";
                            document.getElementById('info').setAttribute('class', 'alert alert-warning');
                        }
                    }
                    else { // плагин не работает, объекты не создаются
                        if (isPluginLoaded) { // плагин загружен
                            if (!isPluginEnabled) { // плагин загружен, но отключен
                                document.getElementById('PlugInEnabledTxt').innerHTML = "Плагин загружен, но отключен в настройках браузера.";
                                document.getElementById('info').setAttribute('class', 'alert alert-warning');
                            }
                            else { // плагин загружен и включен, но объекты не создаются
                                document.getElementById('PlugInEnabledTxt').innerHTML = "Плагин загружен, но не удается создать объекты. Проверьте настройки браузера.";
                                document.getElementById('info').setAttribute('class', 'alert alert-warning');
                            }
                        }
                        else { // плагин не загружен
                            document.getElementById('PlugInEnabledTxt').innerHTML = "Плагин не загружен.";
                            document.getElementById('info').setAttribute('class', 'alert alert-danger');
                        }
                    }
                }
            }
        }
        xmlhttp.send(null);
    }

    var isPluginLoaded = false;
    var isPluginWorked = false;
    var isActualVersion = false;
    try {
        var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
        isPluginLoaded = true;
        isPluginEnabled = true;
        isPluginWorked = true;

        // Это значение будет проверяться сервером при загрузке демо-страницы
        var CurrentPluginVersion = oAbout.PluginVersion;
        if (typeof (CurrentPluginVersion) == "undefined")
            CurrentPluginVersion = oAbout.Version;
        document.getElementById('PlugInEnabledTxt').innerText = "Плагин загружен.";
        document.getElementById('info').setAttribute('class', 'alert alert-success');
    }
    catch (err) {
        // Объект создать не удалось, проверим, установлен ли
        // вообще плагин. Такая возможность есть не во всех браузерах
        var mimetype = navigator.mimeTypes["application/x-cades"];
        if (mimetype) {
            isPluginLoaded = true;
            var plugin = mimetype.enabledPlugin;
            if (plugin) {
                isPluginEnabled = true;
            }
        }
    }
    GetLatestVersion_NPAPI(CurrentPluginVersion);
    if (location.pathname.indexOf("symalgo_sample.html") >= 0) {
        FillCertList_NPAPI('CertListBox1');
        FillCertList_NPAPI('CertListBox2');
    } else {
        FillCertList_NPAPI('CertListBox');
    }
}
function onCertificateSelected(event) {
    var selectedCertID = event.target.selectedIndex;
    var thumbprint = event.target.options[selectedCertID].value.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase();
    try {
        var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        oStore.Open();
    } catch (err) {
        alert('Certificate not found');
        return;
    }

    var all_certs = oStore.Certificates;
    var oCerts = all_certs.Find(cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);

    if (oCerts.Count == 0) {
        alert("Certificate not found");
        return;
    }
    var certificate = oCerts.Item(1);
    FillCertInfo_NPAPI(certificate, event.target.boxId);
}
function Find_Cert(){
    var xhr = new XMLHttpRequest();
    var Data = document.getElementById('DataToVerifyTxtBox').value;
    xhr.open('POST', '/api/Verify', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return

        clearTimeout(xhrTimeout) // очистить таймаут при наступлении readyState 4

        if (xhr.status == 200) {
            alert(xhr.responseText);
        } else {
            handleError(xhr.statusText) // вызвать обработчик ошибки с текстом ответа
        }
    }

    xhr.send("pomoika");
    // Таймаут 10 секунд
    var xhrTimeout = setTimeout(function () { xhr.abort(); handleError("Timeout") }, 10000);

    function handleError(message) {
  // обработчик ошибки
        alert("Ошибка: " + message)
    }
}
function CertificateObj(certObj) {
    this.cert = certObj;
    this.certFromDate = new Date(this.cert.ValidFromDate);
    this.certTillDate = new Date(this.cert.ValidToDate);
}

CertificateObj.prototype.check = function (digit) {
    return (digit < 10) ? "0" + digit : digit;
}

CertificateObj.prototype.extract = function (from, what) {
    certName = "";

    var begin = from.indexOf(what);

    if (begin >= 0) {
        var end = from.indexOf(', ', begin);
        certName = (end < 0) ? from.substr(begin) : from.substr(begin, end - begin);
    }

    return certName;
}

CertificateObj.prototype.DateTimePutTogether = function (certDate) {
    return this.check(certDate.getUTCDate()) + "." + this.check(certDate.getMonth() + 1) + "." + certDate.getFullYear() + " " +
        this.check(certDate.getUTCHours()) + ":" + this.check(certDate.getUTCMinutes()) + ":" + this.check(certDate.getUTCSeconds());
}

CertificateObj.prototype.GetCertString = function () {
    return this.extract(this.cert.SubjectName, 'CN=') + "; Выдан: " + this.GetCertFromDate();
}

CertificateObj.prototype.GetCertFromDate = function () {
    return this.DateTimePutTogether(this.certFromDate);
}

CertificateObj.prototype.GetCertTillDate = function () {
    return this.DateTimePutTogether(this.certTillDate);
}

CertificateObj.prototype.GetPubKeyAlgorithm = function () {
    return this.cert.PublicKey().Algorithm.FriendlyName;
}

CertificateObj.prototype.GetCertName = function () {
    return this.extract(this.cert.SubjectName, 'CN=');
}

CertificateObj.prototype.GetIssuer = function () {
    return this.extract(this.cert.IssuerName, 'CN=');
}

CertificateObj.prototype.GetPrivateKeyProviderName = function () {
    return this.cert.PrivateKey.ProviderName;
}

