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
        [HttpPost, ValidateInput(false)]
        public FileResult GetFile(string SignedXml)
        {

            CreateXml(SignedXml);
            string file_path = Server.MapPath("~/SignedXml.xml");
            // Тип файла - content-type
            string file_type = "application/xml";
            // Имя файла - необязательно
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
    }
}