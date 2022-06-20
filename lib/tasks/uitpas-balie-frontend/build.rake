namespace 'uitpas-balie-frontend' do
  desc "Build binaries"
  task :build do |task|

    require 'json'

    calver_version     = ENV['PIPELINE_VERSION'].nil? ? Time.now.strftime("%Y.%m.%d.%H%M%S") : ENV['PIPELINE_VERSION']
    configuration_hash = { 'basePath' => '/app/', 'buildNumber' => calver_version }

    system('npm install') or exit 1
    system('bower install') or exit 1

    system('angular_config hash -c config.dist.json > config.json') or exit 1
    config = JSON.load File.new('config.json')

    puts "=== DEBUG ==="
    system('pwd && ls -al') or exit 1
    puts "=== DEBUG ==="

    File.open('config.json', 'w') { |file| file.write(config.merge!(configuration_hash).to_json) } or exit 1

    puts "=== DEBUG ==="
    system('cat config.json') or exit 1
    puts "=== DEBUG ==="

    system('grunt build') or exit 1
  end
end
