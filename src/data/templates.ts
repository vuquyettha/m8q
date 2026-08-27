import { Workflow } from '../types';

export const WORKFLOW_TEMPLATES: Workflow[] = [
  {
    id: 'tpl_order_vip_flow',
    name: 'Webhook Đơn hàng → Xử lý VIP Python → Phân nhánh gửi Thông báo',
    description: 'Nhận webhook đơn hàng, chạy script tính chiết khấu Python, rẽ nhánh khách VIP vs Tiêu chuẩn và gửi cảnh báo qua Email/Telegram.',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    webhookId: 'order-received',
    nodes: [
      {
        id: 'node_webhook_1',
        type: 'custom',
        position: { x: 50, y: 180 },
        data: {
          label: 'Nhận Webhook Đơn Hàng',
          nodeType: 'webhook',
          category: 'trigger',
          parameters: {
            webhookPath: 'order-received',
            httpMethod: 'POST',
            samplePayload: {
              event: 'order.created',
              order_id: 'ORD-98421',
              customer: {
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com',
                vip: true,
                total_spent: 1850000,
              },
              items: [
                { sku: 'MACBOOK-M3', name: 'MacBook Pro M3', quantity: 1, price: 1800000 },
                { sku: 'TYPE-C-HUB', name: 'Hub đa cổng USB-C', quantity: 1, price: 50000 },
              ],
              currency: 'VND',
            },
          },
        },
      },
      {
        id: 'node_python_1',
        type: 'custom',
        position: { x: 380, y: 180 },
        data: {
          label: 'Động cơ Chiết khấu Python',
          nodeType: 'pythonCode',
          category: 'action',
          parameters: {
            code: `# Python 3 Node
def execute(item, context):
    customer = item.get('customer', {})
    total = customer.get('total_spent', 0)
    is_vip = customer.get('vip', False)
    
    # 15% VIP discount vs 5% standard
    discount_pct = 15 if is_vip else 5
    discount_amount = total * (discount_pct / 100)
    final_payable = total - discount_amount
    
    return {
        "order_id": item.get('order_id'),
        "customer_name": customer.get('name'),
        "customer_email": customer.get('email'),
        "customer": customer,
        "is_vip": is_vip,
        "original_total": total,
        "discount_percent": discount_pct,
        "discount_amount": discount_amount,
        "final_payable": final_payable,
        "currency": item.get('currency', 'VND'),
        "items": item.get('items', [])
    }`,
          },
        },
      },
      {
        id: 'node_filter_1',
        type: 'custom',
        position: { x: 720, y: 180 },
        data: {
          label: 'Kiểm tra Khách hàng VIP',
          nodeType: 'filter',
          category: 'logic',
          parameters: {
            fieldPath: '{{$json.is_vip}}',
            operator: 'equals',
            compareValue: 'true',
          },
        },
      },
      {
        id: 'node_telegram_vip',
        type: 'custom',
        position: { x: 1060, y: 80 },
        data: {
          label: 'Cảnh báo Kênh Telegram VIP',
          nodeType: 'telegram',
          category: 'output',
          parameters: {
            chatId: '-100198273645',
            message: `🌟 <b>[ĐÃ NHẬN ĐƠN HÀNG VIP]</b>
• Khách hàng: <b>{{$json.customer_name}}</b> (VIP)
• Mã đơn hàng: <code>{{$json.order_id}}</code>
• Số tiền thanh toán: <b>{{$json.final_payable}} {{$json.currency}}</b>
• Chiết khấu VIP: -{{$json.discount_amount}} {{$json.currency}} ({{$json.discount_percent}}%)`,
            parseMode: 'HTML',
          },
        },
      },
      {
        id: 'node_email_vip',
        type: 'custom',
        position: { x: 1400, y: 80 },
        data: {
          label: 'Gửi Email Xác nhận VIP',
          nodeType: 'email',
          category: 'output',
          parameters: {
            to: '{{$json.customer_email}}',
            subject: '⭐ Xác nhận Khách hàng VIP: Đơn hàng #{{$json.order_id}}',
            htmlBody: `<h3>Kính gửi Quý khách VIP {{$json.customer_name}},</h3>
<p>Đơn hàng <strong>#{{$json.order_id}}</strong> của bạn đã được ưu tiên xử lý đặc biệt.</p>
<p>Tổng thanh toán sau ưu đãi VIP 15%: <strong>{{$json.final_payable}} {{$json.currency}}</strong></p>`,
          },
        },
      },
      {
        id: 'node_database_standard',
        type: 'custom',
        position: { x: 1060, y: 300 },
        data: {
          label: 'Lưu Đơn Tiêu chuẩn vào CSDL',
          nodeType: 'database',
          category: 'action',
          parameters: {
            operation: 'INSERT',
            tableName: 'orders_standard',
            recordData: {
              order_id: '{{$json.order_id}}',
              customer_name: '{{$json.customer_name}}',
              amount: '{{$json.final_payable}}',
              status: 'QUEUED',
            },
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'node_webhook_1', target: 'node_python_1', animated: true },
      { id: 'e2', source: 'node_python_1', target: 'node_filter_1', animated: true },
      { id: 'e3', source: 'node_filter_1', target: 'node_telegram_vip', sourceHandle: 'true', animated: true, label: 'VIP (Đúng)' },
      { id: 'e4', source: 'node_telegram_vip', target: 'node_email_vip', animated: true },
      { id: 'e5', source: 'node_filter_1', target: 'node_database_standard', sourceHandle: 'false', animated: true, label: 'Tiêu chuẩn (Sai)' },
    ],
  },
  {
    id: 'tpl_cron_ai_pipeline',
    name: 'Lập lịch Cron API → Tóm tắt Gemini AI → Gửi Bot Telegram',
    description: 'Bộ lập lịch Cron tự động gọi API dữ liệu, phân tích tóm tắt qua Gemini AI và xuất bản báo cáo lên Telegram.',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduleCron: '*/15 * * * *',
    nodes: [
      {
        id: 'node_cron_1',
        type: 'custom',
        position: { x: 60, y: 180 },
        data: {
          label: 'Lập lịch: Mỗi 15 phút',
          nodeType: 'schedule',
          category: 'trigger',
          parameters: {
            cronExpression: '*/15 * * * *',
            intervalPreset: 'every_15_mins',
            timezone: 'Asia/Ho_Chi_Minh',
          },
        },
      },
      {
        id: 'node_http_1',
        type: 'custom',
        position: { x: 380, y: 180 },
        data: {
          label: 'Lấy dữ liệu mới nhất từ API',
          nodeType: 'httpRequest',
          category: 'action',
          parameters: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            headers: { 'Content-Type': 'application/json' },
          },
        },
      },
      {
        id: 'node_gemini_1',
        type: 'custom',
        position: { x: 720, y: 180 },
        data: {
          label: 'Trí tuệ nhân tạo Gemini AI',
          nodeType: 'geminiAI',
          category: 'ai',
          parameters: {
            taskType: 'summarize',
            prompt: 'Hãy phân tích tiêu đề: "{{$json.data.title}}" và nội dung: "{{$json.data.body}}". Tạo một bản tóm tắt điều hành ngắn gọn 2 gạch đầu dòng và đề xuất hành động cho ban lãnh đạo.',
            model: 'gemini-2.5-flash',
          },
        },
      },
      {
        id: 'node_telegram_2',
        type: 'custom',
        position: { x: 1080, y: 180 },
        data: {
          label: 'Xuất bản lên Kênh Telegram',
          nodeType: 'telegram',
          category: 'output',
          parameters: {
            chatId: '-10099887766',
            message: `🤖 <b>[Bản tin Thị trường AI]</b>
• Lịch chạy: <code>{{$json.scheduledAt}}</code>
• Tóm tắt:
{{$json.aiResponse}}`,
            parseMode: 'HTML',
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'node_cron_1', target: 'node_http_1', animated: true },
      { id: 'e2', source: 'node_http_1', target: 'node_gemini_1', animated: true },
      { id: 'e3', source: 'node_gemini_1', target: 'node_telegram_2', animated: true },
    ],
  },
  {
    id: 'tpl_array_loop_flow',
    name: 'Vòng lặp Mảng & Biến đổi dữ liệu Sản phẩm',
    description: 'Minh họa xử lý danh sách: tách mảng items đầu vào để tính thuế VAT, định dạng mã SKU và lưu từng sản phẩm vào CSDL.',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'node_manual_1',
        type: 'custom',
        position: { x: 60, y: 180 },
        data: {
          label: 'Dữ liệu Lô đầu vào (Thủ công)',
          nodeType: 'manual',
          category: 'trigger',
          parameters: {
            initialData: {
              batch_id: 'BATCH-2026-X',
              items: [
                { id: 101, name: 'Bàn phím Keychron Q1 Pro', price: 4200000, category: 'keyboard' },
                { id: 102, name: 'Tai nghe Sony WH-1000XM5', price: 7990000, category: 'headphone' },
                { id: 103, name: 'Màn hình Dell UltraSharp 27', price: 11500000, category: 'monitor' },
              ],
            },
          },
        },
      },
      {
        id: 'node_loop_1',
        type: 'custom',
        position: { x: 400, y: 180 },
        data: {
          label: 'Tách Mảng (Vòng lặp Loop)',
          nodeType: 'arrayIterator',
          category: 'logic',
          parameters: {
            arrayField: 'items',
            batchSize: 1,
          },
        },
      },
      {
        id: 'node_transform_item',
        type: 'custom',
        position: { x: 740, y: 120 },
        data: {
          label: 'Tính Thuế VAT & Chuẩn hóa SKU',
          nodeType: 'transform',
          category: 'action',
          parameters: {
            mappingRules: {
              product_name: '{{$json.name}}',
              vat_10pct: '{{$json.price * 0.1}}',
              total_with_tax: '{{$json.price * 1.1}}',
              formatted_sku: 'ITEM-{{$json.id}}-{{$json.category}}',
            },
          },
        },
      },
      {
        id: 'node_db_item',
        type: 'custom',
        position: { x: 1080, y: 120 },
        data: {
          label: 'Lưu Sản phẩm vào Kho CSDL',
          nodeType: 'database',
          category: 'action',
          parameters: {
            operation: 'INSERT',
            tableName: 'inventory_stock',
            recordData: {
              sku: '{{$json.formatted_sku}}',
              price_vat: '{{$json.total_with_tax}}',
            },
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'node_manual_1', target: 'node_loop_1', animated: true },
      { id: 'e2', source: 'node_loop_1', target: 'node_transform_item', sourceHandle: 'item', animated: true, label: 'Từng phần tử' },
      { id: 'e3', source: 'node_transform_item', target: 'node_db_item', animated: true },
    ],
  },
];
