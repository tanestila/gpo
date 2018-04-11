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
        // НЕ НАШЛА ДАННЫХ О СЕРТИФИКАТЕ
        // ActionResult поменять на стринг например и найти как выводить их формы 
        //или делать еще одну функцию на GET и там отдавать странице.
        [HttpPost, ValidateInput(false)]
        public ActionResult Verify(string DataToVerifyTxtBox, string VerifyTitle)
        {
            XmlDocument xml = new XmlDocument();
            xml.LoadXml(DataToVerifyTxtBox);
            SignedXml sxml = new SignedXml(xml);
            XmlNodeList nodeList = xml.GetElementsByTagName("Signature");
            sxml.LoadXml((XmlElement)nodeList[0]);
            VerifyTitle = sxml.SigningKeyName + "  " + sxml.SignedInfo + sxml.KeyInfo;
            return new HtmlResult(VerifyTitle);
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












