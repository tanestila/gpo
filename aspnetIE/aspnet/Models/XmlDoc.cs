using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml;
namespace aspnet.Models
{
    public class XmlDoc
    {
        public void CreateXml(string text)
        {
            XmlDocument doc = new XmlDocument();
            doc.InnerText = text;
            doc.Save("SignedXml.xml");
        }
    }
}