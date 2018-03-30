// 在浏览器中获取客户端的局域网ip
function fnGetLanIpInBrowser(fnCbk)
{
    // NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23
    var RTCPeerConnection = /*window.RTCPeerConnection ||*/ window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    if (RTCPeerConnection)
    {
        (function () 
         {
            var rtc = new RTCPeerConnection({iceServers:[]});
            // FF [and now Chrome!] needs a channel/stream to proceed
            if (1 || window.mozRTCPeerConnection) 
            {
                rtc.createDataChannel('', {reliable:false});
            };
            
            rtc.onicecandidate = function (evt)
            {
                // convert the candidate to SDP so we can run it through our general parser
                // see https://twitter.com/lancestout/status/525796175425720320 for details
                if (evt.candidate) grepSDP("a="+evt.candidate.candidate);
            };
            rtc.createOffer(function (offerDesc) 
                {
                    grepSDP(offerDesc.sdp);
                    rtc.setLocalDescription(offerDesc);
                }, function (e) { console.warn("offer failed", e); }
            );
            
            
            var addrs = Object.create(null);
            addrs["0.0.0.0"] = false;
            function updateDisplay(newAddr) 
            {
                if (newAddr in addrs) return;
                else addrs[newAddr] = true;
                var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
                fnCbk(displayAddrs.join(" or perhaps ") || "n/a");
            }
            
            function grepSDP(sdp) 
            {
                var hosts = [];
                sdp.split('\r\n').forEach(function (line) 
                {   // c.f. http://tools.ietf.org/html/rfc4566#page-39
                    // http://tools.ietf.org/html/rfc4566#section-5.13
                    // http://tools.ietf.org/html/rfc5245#section-15.1
                    if (~line.indexOf("a=candidate")) 
                    {     
                        var parts = line.split(' '),        
                            addr = parts[4],
                            type = parts[7];
                        if (type === 'host') updateDisplay(addr);
                    }// http://tools.ietf.org/html/rfc4566#section-5.7
                    else if (~line.indexOf("c="))
                    {
                        var parts = line.split(' '),
                            addr = parts[2];
                        updateDisplay(addr);
                    }
                });
            }
        })();
    }else fnCbk("");
}