using CryptoPro.Sharpei;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Security.Cryptography;
using System.Xml;

namespace aspnet.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase upload)
        {
            if (upload != null)
            {
                // получаем имя файла
                string fileName = System.IO.Path.GetFileName(upload.FileName);
                // сохраняем файл в папку Files в проекте
                upload.SaveAs(Server.MapPath("~/Files/" + fileName));
            }
            return RedirectToAction("Index");
        }
        public void Sign()
        {
            XmlNode xmlNode = xmlElement.GetElementsByTagName("SignedInfo")[0];
            XmlDocument xmlDocumentSignInfo = new XmlDocument();
            xmlDocumentSignInfo.PreserveWhitespace = true;
            xmlDocumentSignInfo.LoadXml(xmlNode.OuterXml);
            result = Canonicalize(xmlDocumentSignInfo);
        }
        public string Canonicalize(XmlDocument document)
        {
            XmlDsigExcC14NTransform xmlTransform = new XmlDsigExcC14NTransform();
            xmlTransform.LoadInput(document);
            string result = new StreamReader((MemoryStream)xmlTransform.GetOutput()).ReadToEnd();
            //C# метод канокализации не добавляет в XPath неймсппейс
            result = s.Replace("<XPath>", "<XPath xmlns:dsig=\"http://www.w3.org/2000/09/xmldsig#\">");


            return result;
        }
    }
}