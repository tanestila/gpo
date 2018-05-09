using CryptoPro.Sharpei;
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
using System.Security.Cryptography.Xml;
using Newtonsoft.Json.Linq;

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
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(text);
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
        public string Verify(string text)
        {
            if (text == null)
                return "Введите данные";
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
                    string VerifyTitle = "Серийный номер: "+certinfo.GetSerialNumberString() + "\n"+ "Информация о владельце: " + certinfo.SubjectName.Name + "\n" + "Действителен до: " + certinfo.NotAfter.ToShortDateString() + "\n" + "Название издателя: " + certinfo.IssuerName.Name;
                    return VerifyTitle;
                }
                catch (Exception e)
                {
                    return "Ошибка при обработке данных" + e.ToString();
                }
                
            }
        }
        public class HtmlResult : ActionResult
        {
            private string htmlCode;
            public HtmlResult(string html)
            {
                htmlCode = html;
            }
            public override void ExecuteResult(ControllerContext context)
            {
                string fullHtmlCode = "<!DOCTYPE html><html><head>";
                fullHtmlCode += "<title>Главная страница</title>";
                fullHtmlCode += "<meta charset=utf-8 />";
                fullHtmlCode += "</head> <body>";
                fullHtmlCode += htmlCode;
                fullHtmlCode += "</body></html>";
                context.HttpContext.Response.Write(fullHtmlCode);
            }
        }
    }
}












