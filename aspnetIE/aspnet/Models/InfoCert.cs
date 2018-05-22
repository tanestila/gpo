using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace aspnet.Models
{
    public class InfoCert
    {
        public string IssuerName { get; set; }
        public string NotAfter { get; set; }
        public string SerialNumber { get; set; }
        public string SubjectName { get; set; }
        public string Algorithm { get; set; }
        public string Message { get; set; }
    }
}