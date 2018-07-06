using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Security.Cryptography.X509Certificates;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Xml;
using CAdESCOM;
using Newtonsoft.Json;

namespace ЛетняяПрактикаWCF
{
    public class Response
    {
        public string Algorithm { get; set; }
        public string SerialNumber { get; set; }
        public string NotAfter { get; set; }
        public string SubjectName { get; set; }
        public string IssuerName { get; set; }
        public string CorrectSign { get; set; }
        public string CorrectSertificate { get; set; }
    }
    // ПРИМЕЧАНИЕ. Команду "Переименовать" в меню "Рефакторинг" можно использовать для одновременного изменения имени класса "Service1" в коде, SVC-файле и файле конфигурации.
    // ПРИМЕЧАНИЕ. Чтобы запустить клиент проверки WCF для тестирования службы, выберите элементы Service1.svc или Service1.svc.cs в обозревателе решений и начните отладку.
    public class Service1 : IVerifyservice
    {
        string IVerifyservice.VerifyXml(string xmltext)
        {
            Response response = new Response();
            if (xmltext==null || xmltext=="")
                return "Введите данные";
            else
            {
                try
                {
                    try
                    {
                        SignedXML signed = new SignedXML();
                        signed.Verify(xmltext);
                        response.CorrectSign = "Подпись матетически корректна";
                    }
                    catch
                    {
                        response.CorrectSign = "Подпись недействительна";
                    }
                    XmlDocument xml = new XmlDocument();
                    xml.LoadXml(xmltext);
                    XmlElement xRoot = xml.DocumentElement;
                    XmlNode data = xRoot.LastChild;
                    var certdata = data.LastChild;
                    var certxml = certdata.LastChild;
                    var cert = certxml.LastChild;
                    string certstr = cert.InnerText;
                    certstr = certstr.Trim();
                    X509Certificate2 certinfo = new X509Certificate2(Convert.FromBase64String(certstr));
                    if (certinfo.Verify())
                        response.CorrectSertificate = "Сертификат действителен";
                    else response.CorrectSertificate = "Сертификат не действителен";
                    response.Algorithm = certinfo.SignatureAlgorithm.FriendlyName;
                    response.SerialNumber = certinfo.GetSerialNumberString();
                    response.NotAfter = certinfo.NotAfter.ToShortDateString();
                    response.SubjectName = certinfo.SubjectName.Name;
                    response.IssuerName = certinfo.IssuerName.Name;
                    string json = JsonConvert.SerializeObject(response);
                    return json;
                }
                catch
                {
                    return "Произошла ошибка при обработке";
                }
            }
        }
    }
}
