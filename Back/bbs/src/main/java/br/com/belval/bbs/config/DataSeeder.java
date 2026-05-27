package br.com.belval.bbs.config;

import br.com.belval.bbs.model.Produto;
import br.com.belval.bbs.repository.ProdutoRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private final ProdutoRepository repository;

    public DataSeeder(ProdutoRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Só insere se o banco estiver vazio
        if (repository.count() > 0) return;

        LocalDateTime agora = LocalDateTime.now();

        List<Produto> produtos = List.of(
            p("RTX 3060",           "Nvidia PCYES",                              "2199.00",    10, "gpu",      "https://m.media-amazon.com/images/I/61B8S-xnakL._AC_SY450_.jpg",                                                                                                          agora),
            p("RTX 4070 SUPER",     "NVIDIA GeForce 12GB GDDR6X",                "4499.99",    8,  "gpu",      "https://img.terabyteshop.com.br/produto/g/placa-de-video-gigabyte-nvidia-geforce-rtx-4070-super-windforce-oc-12gb-gddr6x-dlss-ray-tracing-gv-n407swf3oc-12gd_186122.jpg", agora),
            p("NVIDIA RTX 4090",    "GPU 24GB GDDR6X para jogos em 4K",          "11999.99",   5,  "gpu",      "https://cdn.custompc.com/wp-content/sites/custompc/2023/03/nvidia-geforce-rtx-4090-review-01.jpg",                                                                        agora),
            p("Core i3 14100F",     "Intel",                                     "699.99",     15, "cpu",      "https://media.pichau.com.br/media/catalog/product/cache/2f958555330323e505eba7ce930bdf27/b/x/bx8071514100f.jpg",                                                          agora),
            p("AMD Ryzen 5 5600",   "Processador 6-Core AM4",                    "929.99",     12, "cpu",      "https://media.pichau.com.br/media/catalog/product/cache/2f958555330323e505eba7ce930bdf27/1/0/100-100000927box_1.jpg",                                                     agora),
            p("HyperX 16GB",        "Kingston DDR4 3200MHz",                     "1099.99",    20, "ram",      "https://m.media-amazon.com/images/I/614ZZYefLjL._AC_SX679_.jpg",                                                                                                          agora),
            p("SSD NV2 1TB",        "Kingston NVMe M.2",                         "750.00",     18, "ssd",      "https://m.media-amazon.com/images/I/71NfMZKkpQL._AC_SX679_.jpg",                                                                                                          agora),
            p("SSD NV3 1TB",        "Kingston NVMe M.2",                         "900.00",     14, "ssd",      "https://m.media-amazon.com/images/I/71c5uuoM1bL._AC_SX522_.jpg",                                                                                                          agora),
            p("B550M Gaming X",     "Gigabyte",                                  "1700.00",    7,  "mae",      "https://www.gigabyte.com/FileUpload/Global/KeyFeature/3935/innergigabyte/images/product/summary.png",                                                                      agora),
            p("Corsair CV550",      "Fonte 550W 80 Plus Bronze",                 "499.99",     25, "fonte",    "https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Power-Supply-Units/CP-9020210-BR/Gallery/CV550_PSU_13.webp",                             agora),
            p("Hyper 212 Black",    "Cooler Master Air Tower 120mm",             "279.99",     30, "cooler",   "https://m.media-amazon.com/images/I/81fmLqNqa3L._AC_SY450_.jpg",                                                                                                          agora),
            p("Corsair 4000D RGB",  "Mid Tower ATX Vidro Temperado",             "799.99",     9,  "gabinete", "https://images5.kabum.com.br/produtos/fotos/657435/gabinete-gamer-corsair-4000d-rs-argb-mid-tower-lateral-em-vidro-com-3x-fans-rs-argb-preto-cc-9011296-ww_1738086483_gg.jpg", agora),
            p("Monitor LG 27\" 144Hz", "LG UltraGear IPS Full HD",              "1499.99",   11, "monitor",  "https://m.media-amazon.com/images/I/51Z9x1zdkGL._AC_SY355_.jpg",                                                                                                          agora),
            p("Logitech G502 Hero", "Mouse Gamer 25.600 DPI",                   "399.99",    22, "mouse",    "https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_SX679_.jpg",                                                                                                           agora),
            p("Redragon Kumara K552", "Teclado Mecânico TKL RGB",               "249.99",    17, "teclado",  "https://m.media-amazon.com/images/I/71CkbBHCYFL._AC_SX679_.jpg",                                                                                                           agora),
            p("Redragon Flick XL",  "Mousepad Extended 80x30cm",                "129.99",    35, "mousepad", "https://m.media-amazon.com/images/I/71vOT7BPQUL._AC_SX679_.jpg",                                                                                                           agora),
            p("HyperX Cloud II",    "Headset Gamer 7.1 Surround",               "549.99",    13, "headset",  "https://m.media-amazon.com/images/I/71Kxk3yLaaL._AC_SX679_.jpg",                                                                                                           agora)
        );

        repository.saveAll(produtos);
        System.out.println("✅ [DataSeeder] " + produtos.size() + " produtos inseridos no banco.");
    }

    private Produto p(String nome, String descricao, String preco,
                      int estoque, String tipo, String imgUrl, LocalDateTime data) {
        Produto prod = new Produto();
        prod.setNome(nome);
        prod.setDescricao(descricao);
        prod.setPreco(new BigDecimal(preco));
        prod.setEstoque(estoque);
        prod.setTipo(tipo);
        prod.setImgUrl(imgUrl);
        prod.setDataCriacao(data);
        return prod;
    }
}
