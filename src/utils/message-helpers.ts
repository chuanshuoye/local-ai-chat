/**
 * 清理响应消息内容
 * @param content 原始内容
 * @returns 清理后的内容
 */
export function cleanMessageContent(content: string): string {
  if (!content) return '';
  
  // 移除模型响应JSON对象
  content = content.replace(/({"model":"[\w\d\.]+","created_at":".*?","response":".*?","done":.*?,"done_reason":".*?","context":\[.*?\],"total_duration":.*})/g, '');
  // 移除数字序列
  content = content.replace(/(\d+,)+\d+(\[\w+":".*?\}\])?$/g, '');
  
  return content.trim();
}

/**
 * 处理单行JSON响应
 * @param line 可能是JSON字符串的行
 * @returns 提取的响应内容或空字符串
 */
export function processJsonLine(line: string): string {
  try {
    const jsonLine = JSON.parse(line);
    if (jsonLine.response) {
      return jsonLine.response;
    } else if (jsonLine.chunk) {
      return jsonLine.chunk;
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * 处理流式消息内容
 * @param content 原始消息内容
 * @returns 处理后的内容
 */
export function processStreamMessage(content: string): string {
  // 首先清理内容
  const cleanedContent = cleanMessageContent(content);
  
  // 尝试解析整个内容为JSON
  try {
    const jsonContent = JSON.parse(cleanedContent);
    if (jsonContent.response) {
      return jsonContent.response;
    }
  } catch {
    // 如果不是有效的JSON，继续处理
  }

  // 分行处理
  const lines = cleanedContent.split('\n').filter(line => line.trim());
  let extractedContent = '';
  
  // 处理每一行
  for (const line of lines) {
    // 跳过空行和已处理过的行
    if (!line.trim() || line.includes('"done":true') || line.includes("'done':true")) {
      continue;
    }

    // 尝试处理JSON行
    const jsonContent = processJsonLine(line);
    if (jsonContent) {
      extractedContent += jsonContent;
      continue;
    }

    // 如果不是JSON，直接添加非空行
    if (line.trim()) {
      extractedContent += line + '\n';
    }
  }

  return extractedContent.trim() || cleanedContent;
} 