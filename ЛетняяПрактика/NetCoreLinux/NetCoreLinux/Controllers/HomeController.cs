using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using System.Security.Cryptography.Xml;
using System.Xml;
using System.Xml.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using NetCoreLinux.Models;
using System.Security.Cryptography;
using ServiceReference1;
using Newtonsoft.Json;

namespace NetCoreLinux.Controllers
{
    public class HomeController : Controller
    {
        private readonly IHostingEnvironment _appEnvironment;
        public HomeController(IHostingEnvironment appEnvironment)
        {
            _appEnvironment = appEnvironment;
        }
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public FileResult GetFile(string SignedXml)
        {
            CreateXml(SignedXml);
            string file_path = Path.Combine(_appEnvironment.ContentRootPath, "Files", "SignedXml.xml");
            string file_type = "application/xml";
            string file_name = "SignedXml.xml";
            return PhysicalFile(file_path, file_type, file_name);
        }
        public void CreateXml(string text)
        {
            var doc = XDocument.Parse(text, LoadOptions.PreserveWhitespace);
            doc.Save(Path.Combine(_appEnvironment.ContentRootPath, "Files", "SignedXml.xml"));
        }
        [HttpPost]
        public async Task<JsonResult> Verify(string text)
        {
            if (text == null)
                return new JsonResult(new InfoCert { Message = "Введите данные" });
            else
            {
                try
                {
                    VerifyserviceClient wcfclient = new VerifyserviceClient();
                    string response = await wcfclient.VerifyXmlAsync(text);
                    InfoCert verifyInfo = JsonConvert.DeserializeObject<InfoCert>(response);
                    verifyInfo.Message = "Подпись успешно проверена";
                    return new JsonResult(verifyInfo);
                }
                catch (Exception e)
                {
                    return new JsonResult(new InfoCert { Message = "Произошла ошибка при обработке" });
                }

            }
        }
    }
}
