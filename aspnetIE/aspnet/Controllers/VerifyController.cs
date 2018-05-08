using aspnet.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Web.Http;
using System.Xml;

namespace aspnet.Controllers
{
    public class VerifyController : ApiController
    {
        // GET: api/Verify
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/Verify/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Verify
        public string Post(string text) 
        {
            XmlDocument xml = new XmlDocument();
            xml.LoadXml(text);
            XmlElement xRoot = xml.DocumentElement;
            XmlNode data = xRoot.LastChild;
            var certdata = data.LastChild;
            var certxml = certdata.LastChild;
            var cert = certxml.LastChild;
            string certstr = cert.InnerText;
            X509Certificate2 certinfo = new X509Certificate2(Convert.FromBase64String(certstr));
            string VerifyTitle = certinfo.GetSerialNumberString() + " " + certinfo.SubjectName.Name + "\n" + certinfo.NotAfter.ToShortDateString();
            return VerifyTitle;
        }

        // PUT: api/Verify/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Verify/5
        public void Delete(int id)
        {
        }
    }
}
