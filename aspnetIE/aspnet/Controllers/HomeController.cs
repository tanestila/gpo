using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Security.Cryptography;
using System.Xml;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using aspnet.Controllers;
using System.Security.Cryptography.Xml;
using Newtonsoft.Json.Linq;
using aspnet.Models;
using System.Xml.Linq;

namespace aspnet.Controllers
{
    public class HomeController : Controller
    {
        
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost, ValidateInput(false)]
        public FileResult GetFile(string SignedXml)
        {

            CreateXml(SignedXml);
            string file_path = Server.MapPath("~/SignedXml.xml");
            string file_type = "application/xml";
            string file_name = "SignedXml.xml";
            return File(file_path, file_type, file_name);
        }
        public void CreateXml(string text)
        {
            var doc = XDocument.Parse(text, LoadOptions.PreserveWhitespace);
            doc.Save(Server.MapPath("/SignedXml.xml"));
        }
        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase upload)
        {
            if (upload != null)
            {
                string fileName = System.IO.Path.GetFileName(upload.FileName);
                upload.SaveAs(Server.MapPath("~/Files/" + fileName));
            }
            return RedirectToAction("Index");
        }
        [HttpPost, ValidateInput(false)]
        public JsonResult Verify(string text)
        {
            if (text == null)
                return Json(new InfoCert { Message = "Введите данные" });
            else
            {
                try
                {
                    XmlDocument xml = new XmlDocument();
                    xml.LoadXml(text);
                    XmlElement xRoot = xml.DocumentElement;
                    XmlNode data = xRoot.LastChild;
                    var certdata = data.LastChild;
                    var certxml = certdata.LastChild;
                    var cert = certxml.LastChild;
                    string certstr = cert.InnerText;
                    certstr = certstr.Trim();
                    X509Certificate2 certinfo = new X509Certificate2(Convert.FromBase64String(certstr));
                    InfoCert response = new InfoCert()
                    {
                        Algorithm = certinfo.SignatureAlgorithm.FriendlyName,
                        SerialNumber = certinfo.GetSerialNumberString(),
                        NotAfter = certinfo.NotAfter.ToShortDateString(),
                        SubjectName = certinfo.SubjectName.Name,
                        IssuerName = certinfo.IssuerName.Name,
                        Message = "Сертификат успешно распознан"
                    };
                    return Json(response);
                }
                catch (Exception e)
                {
                    return Json(new InfoCert { Message = "Произошла ошибка при обработке" });
                }
                
            }
        }
    }
}












