import { NodeDefinition } from '../types';

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  webhook: {
    type: 'webhook',
    label: 'Kích hoạt Webhook (Trigger)',
    description: 'Lắng nghe các yêu cầu HTTP POST / GET từ bên ngoài để bắt đầu quy trình.',
    category: 'trigger',
    icon: 'Webhook',
    color: 'emerald',
    inputs: [],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'webhookPath',
        label: 'Định danh Webhook (Path)',
        type: 'string',
        default: 'order-received',
        placeholder: 'ví dụ: order-events, user-signup',
        description: 'Đường dẫn endpoint: /api/webhook/:identifier',
      },
      {
        name: 'httpMethod',
        label: 'Phương thức HTTP',
        type: 'select',
        default: 'POST',
        options: [
          { label: 'POST (Gửi dữ liệu)', value: 'POST' },
          { label: 'GET (Truy vấn)', value: 'GET' },
          { label: 'PUT (Cập nhật)', value: 'PUT' },
          { label: 'ALL (Mọi phương thức)', value: 'ALL' },
        ],
      },
      {
        name: 'samplePayload',
        label: 'Dữ liệu mẫu Mock Payload (để chạy thử trực tiếp)',
        type: 'json',
        default: JSON.stringify({
          event: 'order.created',
          order_id: 'ORD-98421',
          customer: {
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            vip: true,
            total_spent: 1250000,
          },
          items: [
            { sku: 'LAPTOP-PRO-16', name: 'MacBook Pro M3', quantity: 1, price: 1200000 },
            { sku: 'MOUSE-MX-3S', name: 'Logitech MX Master 3S', quantity: 1, price: 50000 },
          ],
          currency: 'VND',
        }, null, 2),
      },
    ],
  },

  schedule: {
    type: 'schedule',
    label: 'Lập lịch Cron (Scheduler)',
    description: 'Tự động kích hoạt quy trình theo chu kỳ thời gian hoặc biểu thức Cron.',
    category: 'trigger',
    icon: 'Clock',
    color: 'indigo',
    inputs: [],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'cronExpression',
        label: 'Biểu thức Cron',
        type: 'string',
        default: '*/15 * * * *',
        placeholder: '*/5 * * * * (Mỗi 5 phút)',
        description: 'Cú pháp chuẩn 5 phần: Phút Giờ Ngày Tháng Thứ',
      },
      {
        name: 'intervalPreset',
        label: 'Chu kỳ định sẵn',
        type: 'select',
        default: 'every_15_mins',
        options: [
          { label: 'Mỗi 1 phút', value: 'every_1_min' },
          { label: 'Mỗi 5 phút', value: 'every_5_mins' },
          { label: 'Mỗi 15 phút', value: 'every_15_mins' },
          { label: 'Mỗi giờ (vào :00)', value: 'hourly' },
          { label: 'Hằng ngày lúc 08:00 AM', value: 'daily_8am' },
          { label: 'Hằng tuần vào Thứ Hai', value: 'weekly_mon' },
        ],
      },
      {
        name: 'timezone',
        label: 'Múi giờ',
        type: 'string',
        default: 'Asia/Ho_Chi_Minh',
      },
    ],
  },

  manual: {
    type: 'manual',
    label: 'Kích hoạt Thủ công (Manual)',
    description: 'Chạy quy trình thủ công theo yêu cầu với dữ liệu thử nghiệm tùy chỉnh.',
    category: 'trigger',
    icon: 'PlayCircle',
    color: 'blue',
    inputs: [],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'initialData',
        label: 'Trạng thái JSON ban đầu',
        type: 'json',
        default: JSON.stringify({
          userId: 1042,
          role: 'admin',
          query: 'tối ưu hóa quy trình tự động',
          timestamp: new Date().toISOString(),
        }, null, 2),
      },
    ],
  },

  filter: {
    type: 'filter',
    label: 'Bộ lọc & Rẽ nhánh (If / Condition)',
    description: 'Phân tách nhánh thực thi dựa trên điều kiện logic (nhánh Đúng vs nhánh Sai).',
    category: 'logic',
    icon: 'GitFork',
    color: 'amber',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [
      { id: 'true', label: 'Nhánh Đúng (True)', description: 'Chạy khi điều kiện thỏa mãn' },
      { id: 'false', label: 'Nhánh Sai (False)', description: 'Chạy khi điều kiện không thỏa mãn' },
    ],
    parameters: [
      {
        name: 'fieldPath',
        label: 'Trường dữ liệu cần kiểm tra (hoặc biểu thức)',
        type: 'string',
        default: '{{$json.customer.vip}}',
        placeholder: '{{$json.customer.vip}} hoặc {{$json.total}}',
        description: 'Hỗ trợ biểu thức như {{$json.customer.total_spent}}',
      },
      {
        name: 'operator',
        label: 'Toán tử so sánh',
        type: 'select',
        default: 'equals',
        options: [
          { label: 'Bằng (==)', value: 'equals' },
          { label: 'Khác (!=)', value: 'notEquals' },
          { label: 'Lớn hơn (>)', value: 'greaterThan' },
          { label: 'Nhỏ hơn (<)', value: 'lessThan' },
          { label: 'Chứa chuỗi / phần tử (Contains)', value: 'contains' },
          { label: 'Tồn tại / Truthy (Exists)', value: 'exists' },
        ],
      },
      {
        name: 'compareValue',
        label: 'Giá trị so sánh',
        type: 'string',
        default: 'true',
        placeholder: 'ví dụ: true, 1000000, "success"',
      },
    ],
  },

  pythonCode: {
    type: 'pythonCode',
    label: 'Thực thi Python (Custom Script)',
    description: 'Chạy đoạn mã Python 3 tùy chỉnh với toàn quyền truy cập dữ liệu $json và biến đổi.',
    category: 'action',
    icon: 'Code2',
    color: 'sky',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'code',
        label: 'Mã nguồn Python (Nhận item $json, trả về dict/list kết quả)',
        type: 'code',
        language: 'python',
        default: `# Node xử lý Python 3
# item: dictionary dữ liệu đầu vào ($json)
# context: chứa các hàm helper và dữ liệu node trước

def execute(item, context):
    customer = item.get('customer', {})
    total = customer.get('total_spent', 0)
    
    # Tính chiết khấu & số tiền thanh toán
    discount_pct = 15 if customer.get('vip') else 5
    discount_amount = total * (discount_pct / 100)
    final_amount = total - discount_amount
    
    return {
        "status": "PROCESSED",
        "order_id": item.get('order_id'),
        "customer_name": customer.get('name'),
        "customer_email": customer.get('email'),
        "original_total": total,
        "discount_percent": discount_pct,
        "discount_amount": discount_amount,
        "final_payable": final_amount,
        "currency": item.get('currency', 'VND'),
        "processed_by": "M8Q Python 3.12 Engine"
    }
`,
      },
    ],
  },

  httpRequest: {
    type: 'httpRequest',
    label: 'Gọi API HTTP (REST API)',
    description: 'Gửi yêu cầu REST API (GET, POST, PUT, DELETE) với header và xác thực tùy chỉnh.',
    category: 'action',
    icon: 'Globe',
    color: 'emerald',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'method',
        label: 'Phương thức',
        type: 'select',
        default: 'GET',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
      },
      {
        name: 'url',
        label: 'Địa chỉ URL Endpoint',
        type: 'string',
        default: 'https://jsonplaceholder.typicode.com/posts/1',
        placeholder: 'https://api.example.com/data/{{$json.id}}',
      },
      {
        name: 'headers',
        label: 'HTTP Headers (JSON)',
        type: 'json',
        default: JSON.stringify({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{$env.API_TOKEN}}'
        }, null, 2),
      },
      {
        name: 'body',
        label: 'Nội dung Body (cho POST/PUT)',
        type: 'textarea',
        default: JSON.stringify({
          title: 'Đơn hàng xử lý cho {{$json.customer_name}}',
          amount: '{{$json.final_payable}}',
          refId: '{{$json.order_id}}'
        }, null, 2),
      },
      {
        name: 'authType',
        label: 'Loại xác thực',
        type: 'select',
        default: 'none',
        options: [
          { label: 'Không xác thực (None)', value: 'none' },
          { label: 'Bearer Token', value: 'bearer' },
          { label: 'Basic Auth (User/Password)', value: 'basic' },
          { label: 'API Key (Header / Query)', value: 'apiKey' },
        ],
      },
    ],
  },

  transform: {
    type: 'transform',
    label: 'Thiết lập & Biến đổi dữ liệu (Set/Map)',
    description: 'Tạo trường mới, đổi tên thuộc tính, tính toán giá trị và chuẩn hóa dữ liệu.',
    category: 'action',
    icon: 'Wand2',
    color: 'teal',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'keepOnlySet',
        label: 'Chỉ giữ lại các trường được khai báo',
        type: 'boolean',
        default: false,
        description: 'Nếu bật, loại bỏ các trường không nằm trong danh sách ánh xạ.',
      },
      {
        name: 'mappingRules',
        label: 'Quy tắc ánh xạ trường (Đối tượng JSON)',
        type: 'json',
        default: JSON.stringify({
          "summary": "Đơn hàng {{$json.order_id}} của {{$json.customer_name}}",
          "is_high_value": "{{$json.final_payable > 1000000}}",
          "processed_at": "{{new Date().toISOString()}}",
          "tier": "{{$json.discount_percent >= 10 ? 'VIP Vàng' : 'Tiêu chuẩn'}}"
        }, null, 2),
      },
    ],
  },

  arrayIterator: {
    type: 'arrayIterator',
    label: 'Vòng lặp & Tách mảng (Loop / Splitter)',
    description: 'Duyệt qua từng phần tử của mảng dữ liệu và thực thi các node phía sau cho mỗi phần tử.',
    category: 'logic',
    icon: 'Repeat',
    color: 'orange',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [
      { id: 'item', label: 'Từng phần tử (Item)', description: 'Chạy cho mỗi phần tử trong mảng' },
      { id: 'done', label: 'Hoàn thành (Done)', description: 'Chạy sau khi toàn bộ mảng đã xử lý xong' },
    ],
    parameters: [
      {
        name: 'arrayField',
        label: 'Đường dẫn trường mảng',
        type: 'string',
        default: 'items',
        placeholder: 'ví dụ: items, products, results',
        description: 'Khóa chứa mảng cần lặp (vd: items -> $json.items)',
      },
      {
        name: 'batchSize',
        label: 'Kích thước lô (Số phần tử xử lý song song)',
        type: 'number',
        default: 1,
      },
    ],
  },

  geminiAI: {
    type: 'geminiAI',
    label: 'Trí tuệ nhân tạo Gemini AI',
    description: 'Sinh văn bản, tóm tắt báo cáo, phân loại cảm xúc hoặc trích xuất dữ liệu JSON có cấu trúc.',
    category: 'ai',
    icon: 'Sparkles',
    color: 'purple',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'taskType',
        label: 'Loại tác vụ AI',
        type: 'select',
        default: 'summarize',
        options: [
          { label: 'Tóm tắt & Trích xuất thông tin chính', value: 'summarize' },
          { label: 'Phân tích cảm xúc & Phân loại', value: 'sentiment' },
          { label: 'Prompt tùy chỉnh có chèn biến', value: 'custom' },
          { label: 'Trích xuất dữ liệu thành định dạng JSON', value: 'json_extract' },
        ],
      },
      {
        name: 'prompt',
        label: 'Mẫu câu lệnh Prompt (hỗ trợ {{$json.field}})',
        type: 'textarea',
        default: 'Hãy viết một thông điệp cảm ơn ấm áp và tóm tắt giao hàng cho khách hàng VIP {{$json.customer_name}} đã mua đơn hàng {{$json.order_id}} với số tiền thanh toán {{$json.final_payable}} {{$json.currency}}.',
      },
      {
        name: 'model',
        label: 'Mô hình Gemini',
        type: 'select',
        default: 'gemini-2.5-flash',
        options: [
          { label: 'Gemini 2.5 Flash (Nhanh & Thông minh)', value: 'gemini-2.5-flash' },
          { label: 'Gemini 2.5 Pro (Tư duy & Suy luận nâng cao)', value: 'gemini-2.5-pro' },
        ],
      },
    ],
  },

  email: {
    type: 'email',
    label: 'Gửi Email thông báo (SMTP)',
    description: 'Tự động gửi email thông báo định dạng HTML hoặc hóa đơn điện tử cho khách hàng.',
    category: 'output',
    icon: 'Mail',
    color: 'rose',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'to',
        label: 'Email người nhận',
        type: 'string',
        default: '{{$json.customer_email}}',
        placeholder: 'user@example.com hoặc {{$json.customer_email}}',
      },
      {
        name: 'subject',
        label: 'Tiêu đề Email',
        type: 'string',
        default: 'Đơn hàng #{{$json.order_id}} của bạn đã được xác nhận!',
      },
      {
        name: 'htmlBody',
        label: 'Nội dung Email (HTML / Văn bản)',
        type: 'textarea',
        default: `<h3>Xin chào {{$json.customer_name}},</h3>
<p>Đơn hàng <strong>#{{$json.order_id}}</strong> của bạn đã được tiếp nhận và xử lý thành công qua hệ thống tự động hóa M8Q.</p>
<ul>
  <li>Tổng tiền gốc: {{$json.original_total}} {{$json.currency}}</li>
  <li>Ưu đãi VIP ({{$json.discount_percent}}%): -{{$json.discount_amount}} {{$json.currency}}</li>
  <li><strong>Số tiền cần thanh toán: {{$json.final_payable}} {{$json.currency}}</strong></li>
</ul>
<p>Cảm ơn bạn đã luôn tin tưởng và đồng hành cùng chúng tôi!</p>`,
      },
    ],
  },

  telegram: {
    type: 'telegram',
    label: 'Gửi tin nhắn Telegram Bot',
    description: 'Gửi cảnh báo và thông báo tức thì đến nhóm chat hoặc kênh Telegram.',
    category: 'output',
    icon: 'Send',
    color: 'blue',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'chatId',
        label: 'ID Nhóm chat / Kênh Telegram',
        type: 'string',
        default: '-100198273645',
        placeholder: 'ví dụ: @my_channel hoặc -100123456789',
      },
      {
        name: 'message',
        label: 'Định dạng nội dung tin nhắn',
        type: 'textarea',
        default: `🔔 <b>[M8Q Alert] Có Đơn Hàng VIP Mới!</b>
• Mã đơn: <code>{{$json.order_id}}</code>
• Khách hàng: <b>{{$json.customer_name}}</b> (VIP: {{$json.customer.vip ? 'Có' : 'Không'}})
• Tổng thanh toán: <b>{{$json.final_payable}} {{$json.currency}}</b>
• Thời gian: {{$json.timestamp}}`,
      },
      {
        name: 'parseMode',
        label: 'Chế độ định dạng (Parse Mode)',
        type: 'select',
        default: 'HTML',
        options: [
          { label: 'HTML', value: 'HTML' },
          { label: 'MarkdownV2', value: 'MarkdownV2' },
          { label: 'Văn bản thuần (Plain Text)', value: 'Plain' },
        ],
      },
    ],
  },

  database: {
    type: 'database',
    label: 'Lưu trữ Cơ sở dữ liệu (SQL / CRUD)',
    description: 'Chèn, cập nhật hoặc truy vấn bản ghi trong cơ sở dữ liệu với JSON có cấu trúc.',
    category: 'action',
    icon: 'Database',
    color: 'violet',
    inputs: [{ id: 'input', label: 'Đầu vào' }],
    outputs: [{ id: 'output', label: 'Đầu ra' }],
    parameters: [
      {
        name: 'operation',
        label: 'Thao tác dữ liệu',
        type: 'select',
        default: 'INSERT',
        options: [
          { label: 'Thêm bản ghi (INSERT)', value: 'INSERT' },
          { label: 'Cập nhật bản ghi (UPDATE)', value: 'UPDATE' },
          { label: 'Truy vấn (SELECT)', value: 'SELECT' },
        ],
      },
      {
        name: 'tableName',
        label: 'Tên Bảng / Collection',
        type: 'string',
        default: 'orders',
      },
      {
        name: 'recordData',
        label: 'Dữ liệu bản ghi (JSON)',
        type: 'json',
        default: JSON.stringify({
          order_id: '{{$json.order_id}}',
          customer_email: '{{$json.customer_email}}',
          amount: '{{$json.final_payable}}',
          status: 'COMPLETED',
          created_at: '{{new Date().toISOString()}}'
        }, null, 2),
      },
    ],
  },
};
